import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreditsService, GENERATION_COSTS, ADVANCED_OPTIONS_COSTS, calculateTotalCost, type GenerationMode, type QualityLevel, type AdvancedOption } from '@/lib/credits/service';
import { checkRateLimit } from '@/lib/rate-limit';
import { tripo3d, isTripoConfigured, Tripo3DError, type GenerationConfig } from '@/lib/tripo3d/service';

// 生产环境日志
const log = {
  info: (msg: string, data?: any) => console.log(`[Generate] ${msg}`, data ? JSON.stringify(data) : ''),
  error: (msg: string, error?: any) => console.error(`[Generate] ERROR: ${msg}`, error),
  warn: (msg: string, data?: any) => console.warn(`[Generate] WARN: ${msg}`, data ? JSON.stringify(data) : ''),
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = checkRateLimit(user.id, 'api:generate');
    if (!rateLimit.allowed) {
      return NextResponse.json({ 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(rateLimit.resetIn / 1000),
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimit.resetIn / 1000).toString(),
        }
      });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const files = formData.getAll('files') as File[]; // 多视角图片
    const textPrompt = formData.get('textPrompt') as string | null;
    const mode = (formData.get('mode') as string) || 'IMAGE_TO_3D';
    const quality = (formData.get('quality') as string) || 'standard';
    const format = (formData.get('format') as string) || 'glb';
    
    // 高级选项
    const hdTexture = formData.get('hdTexture') === 'true';
    const pbrMaterial = formData.get('pbrMaterial') === 'true';
    const rigging = formData.get('rigging') === 'true';
    const lowPoly = formData.get('lowPoly') === 'true';
    const partSegment = formData.get('partSegment') === 'true';

    // 验证输入
    if (mode === 'TEXT_TO_3D' && !textPrompt) {
      return NextResponse.json({ error: 'Text prompt is required for text-to-3D', code: 'MISSING_PROMPT' }, { status: 400 });
    }
    if (mode === 'TEXT_TO_3D' && textPrompt && textPrompt.length > 500) {
      return NextResponse.json({ error: 'Text prompt too long (max 500 chars)', code: 'PROMPT_TOO_LONG' }, { status: 400 });
    }
    if (mode === 'IMAGE_TO_3D' && !file) {
      return NextResponse.json({ error: 'Image is required for image-to-3D', code: 'MISSING_IMAGE' }, { status: 400 });
    }
    if (mode === 'DOODLE' && !file) {
      return NextResponse.json({ error: 'Doodle image is required', code: 'MISSING_DOODLE' }, { status: 400 });
    }
    if (mode === 'MULTI_VIEW' && files.length < 2) {
      return NextResponse.json({ error: 'At least 2 images required for multi-view', code: 'INSUFFICIENT_IMAGES' }, { status: 400 });
    }
    if (mode === 'MULTI_VIEW' && files.length > 6) {
      return NextResponse.json({ error: 'Maximum 6 images allowed for multi-view', code: 'TOO_MANY_IMAGES' }, { status: 400 });
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (file && !allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid image format. Use JPEG, PNG or WebP', code: 'INVALID_FORMAT' }, { status: 400 });
    }
    
    // 验证文件大小 (最大 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file && file.size > maxSize) {
      return NextResponse.json({ error: 'Image too large (max 10MB)', code: 'FILE_TOO_LARGE' }, { status: 400 });
    }

    // 计算积分消耗
    const qualityMap: Record<string, QualityLevel> = {
      standard: 'STANDARD',
      high: 'HIGH',
      ultra: 'ULTRA',
    };
    const advancedOptions: AdvancedOption[] = [];
    if (hdTexture) advancedOptions.push('HD_TEXTURE');
    if (pbrMaterial) advancedOptions.push('PBR_MATERIAL');
    if (rigging) advancedOptions.push('RIGGING');
    if (lowPoly) advancedOptions.push('LOW_POLY');
    if (partSegment) advancedOptions.push('PART_SEGMENT');

    const creditsRequired = calculateTotalCost(
      mode as GenerationMode,
      qualityMap[quality] || 'STANDARD',
      advancedOptions
    );

    // 检查积分余额
    const balance = await CreditsService.getBalance(user.id);
    if (balance < creditsRequired) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: creditsRequired,
        balance,
      }, { status: 402 });
    }

    // 上传图片到 Supabase Storage
    let sourceImageUrl = '';
    let sourceImageUrls: string[] = [];

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('generations')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }

      const { data: urlData } = supabase.storage
        .from('generations')
        .getPublicUrl(fileName);
      
      sourceImageUrl = urlData.publicUrl;
    }

    // 多视角图片上传
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const fileExt = f.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('generations')
          .upload(fileName, f);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('generations')
          .getPublicUrl(fileName);
        
        sourceImageUrls.push(urlData.publicUrl);
      }
    }

    if (mode === 'TEXT_TO_3D' && textPrompt) {
      sourceImageUrl = `text:${textPrompt}`;
    }

    // 扣除积分
    const deductResult = await CreditsService.deductCredits(
      user.id,
      creditsRequired,
      `3D Generation (${mode}, ${quality}${advancedOptions.length > 0 ? ', ' + advancedOptions.join(', ') : ''})`
    );

    if (!deductResult.success) {
      return NextResponse.json({ error: deductResult.error }, { status: 402 });
    }

    // 创建生成记录
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        source_image_url: sourceImageUrl || sourceImageUrls[0] || '',
        quality: quality.toUpperCase(),
        credits_used: creditsRequired,
        status: 'PENDING',
        // 存储生成配置用于调试
        metadata: JSON.stringify({
          mode,
          format,
          advancedOptions: advancedOptions,
          timestamp: new Date().toISOString(),
        }),
      })
      .select()
      .single();

    if (genError) {
      log.error('Failed to create generation record', genError);
      // 退款
      await CreditsService.refundCredits(user.id, creditsRequired, 'failed');
      return NextResponse.json({ error: 'Failed to create generation', code: 'DB_ERROR' }, { status: 500 });
    }

    log.info('Generation created', { id: generation.id, mode, credits: creditsRequired });

    // 调用 Tripo3D API 进行生成 (异步处理)
    processTripo3DGeneration(
      generation.id,
      supabase,
      {
        mode: mode as GenerationMode,
        textPrompt,
        imageUrl: sourceImageUrl,
        imageUrls: sourceImageUrls,
        quality: qualityMap[quality],
        hdTexture,
        pbrMaterial,
        rigging,
        lowPoly,
        partSegment,
        format,
      }
    );

    return NextResponse.json({
      success: true,
      generationId: generation.id,
      creditsUsed: creditsRequired,
      newBalance: deductResult.newBalance,
      mode,
      estimatedTime: getEstimatedTime(mode as GenerationMode, advancedOptions),
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface ProcessOptions {
  mode: GenerationMode;
  textPrompt: string | null;
  imageUrl: string;
  imageUrls: string[];
  quality: QualityLevel;
  hdTexture: boolean;
  pbrMaterial: boolean;
  rigging: boolean;
  lowPoly: boolean;
  partSegment: boolean;
  format: string;
}

// 估算生成时间 (秒)
function getEstimatedTime(mode: GenerationMode, options: AdvancedOption[]): number {
  let baseTime = 30; // 基础时间
  
  switch (mode) {
    case 'TEXT_TO_3D': baseTime = 45; break;
    case 'IMAGE_TO_3D': baseTime = 30; break;
    case 'MULTI_VIEW': baseTime = 60; break;
    case 'DOODLE': baseTime = 35; break;
  }
  
  // 高级选项增加时间
  if (options.includes('HD_TEXTURE')) baseTime += 15;
  if (options.includes('PBR_MATERIAL')) baseTime += 10;
  if (options.includes('RIGGING')) baseTime += 30;
  if (options.includes('LOW_POLY')) baseTime += 20;
  if (options.includes('PART_SEGMENT')) baseTime += 25;
  
  return baseTime;
}

// Tripo3D 生成处理 (生产级)
async function processTripo3DGeneration(generationId: string, supabase: any, options: ProcessOptions) {
  const startTime = Date.now();
  
  try {
    // 更新状态为处理中
    await supabase
      .from('generations')
      .update({ status: 'PROCESSING', started_at: new Date().toISOString() })
      .eq('id', generationId);

    // 检查是否配置了 Tripo3D API Key
    if (!isTripoConfigured()) {
      log.warn('TRIPO3D_API_KEY not configured, using mock mode');
      await mockGeneration(generationId, supabase);
      return;
    }

    // 构建 Tripo3D 配置
    const tripoConfig: Partial<GenerationConfig> = {
      texture_quality: options.hdTexture ? 'high' : 'standard',
      pbr: options.pbrMaterial,
    };

    let taskResult;

    // 根据模式调用不同的 API
    switch (options.mode) {
      case 'TEXT_TO_3D':
        if (!options.textPrompt) throw new Tripo3DError('Text prompt required', 'MISSING_PROMPT', 400, false);
        log.info('Starting text-to-3D', { prompt: options.textPrompt.substring(0, 50) });
        taskResult = await tripo3d.textToModel(options.textPrompt, tripoConfig);
        break;
      
      case 'IMAGE_TO_3D':
        if (!options.imageUrl || options.imageUrl.startsWith('text:')) {
          throw new Tripo3DError('Image URL required', 'MISSING_IMAGE', 400, false);
        }
        log.info('Starting image-to-3D', { imageUrl: options.imageUrl.substring(0, 50) });
        taskResult = await tripo3d.imageToModel(options.imageUrl, tripoConfig);
        break;
      
      case 'MULTI_VIEW':
        if (options.imageUrls.length < 2) {
          throw new Tripo3DError('At least 2 images required', 'INSUFFICIENT_IMAGES', 400, false);
        }
        log.info('Starting multi-view-to-3D', { imageCount: options.imageUrls.length });
        taskResult = await tripo3d.multiviewToModel(options.imageUrls, tripoConfig);
        break;
      
      case 'DOODLE':
        if (!options.imageUrl || options.imageUrl.startsWith('text:')) {
          throw new Tripo3DError('Doodle image required', 'MISSING_DOODLE', 400, false);
        }
        log.info('Starting doodle-to-3D');
        taskResult = await tripo3d.doodleToModel(options.imageUrl, undefined, tripoConfig);
        break;
      
      default:
        throw new Tripo3DError(`Unsupported mode: ${options.mode}`, 'INVALID_MODE', 400, false);
    }

    // 保存任务 ID
    await supabase
      .from('generations')
      .update({ tripo_task_id: taskResult.task_id })
      .eq('id', generationId);

    // 等待任务完成 (5分钟超时)
    const result = await tripo3d.waitForCompletion(taskResult.task_id, 300000);

    if (result.status === 'failed') {
      throw new Tripo3DError(result.error || 'Generation failed', 'TRIPO_FAILED', 500, false);
    }

    let finalModelUrl = result.output?.model_url;
    let thumbnailUrl = result.output?.thumbnail_url;

    // 后处理: 骨骼绑定
    if (options.rigging && result.task_id) {
      log.info('Starting rigging', { taskId: result.task_id });
      try {
        const rigResult = await tripo3d.rigModel(result.task_id);
        const riggedResult = await tripo3d.waitForCompletion(rigResult.task_id, 120000);
        if (riggedResult.output?.rigged_model_url) {
          finalModelUrl = riggedResult.output.rigged_model_url;
        }
      } catch (rigError: any) {
        log.warn('Rigging failed, using original model', { error: rigError.message });
      }
    }

    // 后处理: 低多边形优化
    if (options.lowPoly && result.task_id) {
      log.info('Starting retopology', { taskId: result.task_id });
      try {
        const retopoResult = await tripo3d.retopologyModel(result.task_id, 10000);
        const optimizedResult = await tripo3d.waitForCompletion(retopoResult.task_id, 120000);
        if (optimizedResult.output?.model_url) {
          finalModelUrl = optimizedResult.output.model_url;
        }
      } catch (retopoError: any) {
        log.warn('Retopology failed, using original model', { error: retopoError.message });
      }
    }

    // 后处理: 部件分割
    if (options.partSegment && result.task_id) {
      log.info('Starting segmentation', { taskId: result.task_id });
      try {
        const segResult = await tripo3d.segmentModel(result.task_id);
        const segmentedResult = await tripo3d.waitForCompletion(segResult.task_id, 120000);
        if (segmentedResult.output?.segmented_model_url) {
          finalModelUrl = segmentedResult.output.segmented_model_url;
        }
      } catch (segError: any) {
        log.warn('Segmentation failed, using original model', { error: segError.message });
      }
    }

    const processingTime = Date.now() - startTime;
    log.info('Generation completed', { 
      generationId, 
      processingTimeMs: processingTime,
      hasModel: !!finalModelUrl 
    });

    // 更新生成记录
    await supabase
      .from('generations')
      .update({ 
        status: 'COMPLETED',
        model_url: finalModelUrl,
        thumbnail_url: thumbnailUrl,
        completed_at: new Date().toISOString(),
        processing_time_ms: processingTime,
      })
      .eq('id', generationId);

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Tripo3DError 
      ? `[${error.code}] ${error.message}`
      : error.message || 'Generation failed';
    
    log.error('Generation failed', { 
      generationId, 
      error: errorMessage,
      processingTimeMs: processingTime 
    });

    await supabase
      .from('generations')
      .update({ 
        status: 'FAILED',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
        processing_time_ms: processingTime,
      })
      .eq('id', generationId);
  }
}

// 模拟生成 (当没有配置 API Key 时使用)
async function mockGeneration(generationId: string, supabase: any) {
  // 模拟处理时间 (5-10秒)
  await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 5000));

  // 模拟完成 - 使用示例模型
  await supabase
    .from('generations')
    .update({ 
      status: 'COMPLETED',
      model_url: '/models/model.obj',
      thumbnail_url: '/models/thumbnail.png',
      completed_at: new Date().toISOString(),
    })
    .eq('id', generationId);
}

// 获取生成状态
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const generationId = searchParams.get('id');

    if (generationId) {
      // 获取单个生成记录
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('id', generationId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Generation not found' }, { status: 404 });
      }

      return NextResponse.json(data);
    } else {
      // 获取所有生成记录
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch generations' }, { status: 500 });
      }

      return NextResponse.json(data);
    }

  } catch (error) {
    console.error('Get generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
