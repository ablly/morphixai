/**
 * Tripo3D API Service - Production Ready
 * 
 * 官方文档: https://platform.tripo3d.ai/docs
 * 定价: https://platform.tripo3d.ai/docs/pricing
 * 
 * 模型版本:
 * - v3.0 (最新): 支持 text/image/texture 模式
 * - v2.5, v2.0: 旧版本
 * - Turbo V1.0: 快速模式
 * - V1.4: 最新精细模型
 * 
 * 积分消耗 (2025):
 * - 文字转3D: 无纹理7 / 标准纹理10 / 高清纹理20
 * - 图片转3D: 无纹理7 / 标准纹理20 / 高清纹理30
 * - 多视角转3D: 无纹理7 / 标准纹理20 / 高清纹理30
 * - 骨骼绑定: 25
 * - 分割: 40
 * - 低多边形: 10
 * - 重拓扑: 10
 * - 精细几何: 20
 * 
 * 输出格式: GLB, FBX, OBJ, USDZ, STL
 */

const TRIPO_API_BASE = 'https://api.tripo3d.ai/v2/openapi';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// 模型版本
export type ModelVersion = 'v3.0' | 'v2.5' | 'v2.0-20240919' | 'turbo-v1.0' | 'v1.4';

// 生成模式
export type TripoGenerationMode = 'text_to_model' | 'image_to_model' | 'multiview_to_model';

// 输出格式
export type OutputFormat = 'glb' | 'fbx' | 'obj' | 'usdz' | 'stl';

// 纹理质量
export type TextureQuality = 'none' | 'standard' | 'detailed';

// 生成配置
export interface GenerationConfig {
  mode: TripoGenerationMode;
  prompt?: string;
  image?: string;
  images?: string[];
  model_version?: ModelVersion;
  texture?: boolean; // false = 无纹理 (7积分)
  texture_quality?: TextureQuality; // standard (默认) / detailed (高清)
  pbr?: boolean;
  auto_rig?: boolean;
  low_poly?: boolean;
  part_segment?: boolean;
  output_format?: OutputFormat;
  face_limit?: number;
  quad?: boolean; // 四边形拓扑 +5积分
  style?: string; // 风格化 +5积分
  // 涂鸦模式特殊参数
  sketch_mode?: boolean;
  style_prompt?: string;
}

// 任务状态
export type TaskStatus = 'queued' | 'running' | 'success' | 'failed' | 'cancelled';

// 任务结果
export interface TaskResult {
  task_id: string;
  status: TaskStatus;
  progress?: number;
  output?: {
    model_url?: string;
    texture_urls?: {
      base_color?: string;
      metallic?: string;
      roughness?: string;
      normal?: string;
    };
    thumbnail_url?: string;
    pbr_model_url?: string;
    rigged_model_url?: string;
    segmented_model_url?: string;
  };
  error?: string;
  created_at?: string;
  finished_at?: string;
}

// API 错误类型
export class Tripo3DError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'Tripo3DError';
  }
}

class Tripo3DService {
  private apiKey: string;
  private isConfigured: boolean;

  constructor() {
    this.apiKey = process.env.TRIPO3D_API_KEY || '';
    this.isConfigured = !!this.apiKey;
  }

  /**
   * 检查 API 是否已配置
   */
  isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * 带重试的 API 请求
   */
  private async request(endpoint: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<any> {
    if (!this.isConfigured) {
      throw new Tripo3DError('TRIPO3D_API_KEY not configured', 'NOT_CONFIGURED', 500, false);
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(`${TRIPO_API_BASE}${endpoint}`, {
          ...options,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const isRetryable = response.status >= 500 || response.status === 429;
          throw new Tripo3DError(
            data.message || data.error || `API request failed: ${response.status}`,
            data.code || 'API_ERROR',
            response.status,
            isRetryable
          );
        }

        return data;
      } catch (error: any) {
        lastError = error;
        
        // 如果是不可重试的错误，直接抛出
        if (error instanceof Tripo3DError && !error.retryable) {
          throw error;
        }

        // 等待后重试
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (attempt + 1)));
          console.log(`Tripo3D API retry attempt ${attempt + 2}/${retries}`);
        }
      }
    }

    throw lastError || new Tripo3DError('Request failed after retries', 'MAX_RETRIES', 500, false);
  }

  /**
   * 文字转3D
   * 积分: 无纹理7 / 标准纹理10 / 高清纹理20
   */
  async textToModel(prompt: string, options: Partial<GenerationConfig> = {}): Promise<TaskResult> {
    const modelVersion = options.model_version || 'v2.0-20240919';
    
    const data = await this.request('/task', {
      method: 'POST',
      body: JSON.stringify({
        type: 'text_to_model',
        prompt,
        model_version: modelVersion,
        ...this.buildOptions(options),
      }),
    });

    return {
      task_id: data.data.task_id,
      status: 'queued',
    };
  }

  /**
   * 单图转3D
   * 积分: 无纹理7 / 标准纹理20 / 高清纹理30
   */
  async imageToModel(imageUrl: string, options: Partial<GenerationConfig> = {}): Promise<TaskResult> {
    const modelVersion = options.model_version || 'v2.0-20240919';
    
    const data = await this.request('/task', {
      method: 'POST',
      body: JSON.stringify({
        type: 'image_to_model',
        file: {
          type: 'url',
          url: imageUrl,
        },
        model_version: modelVersion,
        ...this.buildOptions(options),
      }),
    });

    return {
      task_id: data.data.task_id,
      status: 'queued',
    };
  }

  /**
   * 多视角转3D
   * 积分: 无纹理7 / 标准纹理20 / 高清纹理30
   * 注意: 不支持 Turbo-v1.0
   */
  async multiviewToModel(imageUrls: string[], options: Partial<GenerationConfig> = {}): Promise<TaskResult> {
    if (imageUrls.length < 2 || imageUrls.length > 6) {
      throw new Tripo3DError('Multi-view requires 2-6 images', 'INVALID_INPUT', 400, false);
    }

    // 多视角不支持 Turbo 模式
    const modelVersion = options.model_version === 'turbo-v1.0' 
      ? 'v2.0-20240919' 
      : (options.model_version || 'v2.0-20240919');

    const data = await this.request('/task', {
      method: 'POST',
      body: JSON.stringify({
        type: 'multiview_to_model',
        files: imageUrls.map(url => ({
          type: 'url',
          url,
        })),
        model_version: modelVersion,
        ...this.buildOptions(options),
      }),
    });

    return {
      task_id: data.data.task_id,
      status: 'queued',
    };
  }

  /**
   * 涂鸦/草图转3D (Doodle/Sketch to 3D)
   * 使用 image_to_model，适合简笔画/草图输入
   */
  async doodleToModel(imageUrl: string, stylePrompt?: string, options: Partial<GenerationConfig> = {}): Promise<TaskResult> {
    const data = await this.request('/task', {
      method: 'POST',
      body: JSON.stringify({
        type: 'image_to_model',
        file: {
          type: 'url',
          url: imageUrl,
        },
        model_version: options.model_version || 'v2.0-20240919',
        ...this.buildOptions(options),
        // 如果提供了风格提示词，添加到请求中
        ...(stylePrompt ? { prompt: stylePrompt } : {}),
      }),
    });

    return {
      task_id: data.data.task_id,
      status: 'queued',
    };
  }

  /**
   * 部件分割 (对已生成的模型)
   */
  async segmentModel(originalTaskId: string): Promise<TaskResult> {
    const data = await this.request('/task', {
      method: 'POST',
      body: JSON.stringify({
        type: 'segment',
        original_model_task_id: originalTaskId,
      }),
    });

    return {
      task_id: data.data.task_id,
      status: 'queued',
    };
  }

  /**
   * 智能低多边形优化 (对已生成的模型)
   */
  async retopologyModel(originalTaskId: string, targetFaces: number = 10000): Promise<TaskResult> {
    const data = await this.request('/task', {
      method: 'POST',
      body: JSON.stringify({
        type: 'retopology',
        original_model_task_id: originalTaskId,
        target_face_count: targetFaces,
      }),
    });

    return {
      task_id: data.data.task_id,
      status: 'queued',
    };
  }

  /**
   * 获取任务状态
   */
  async getTaskStatus(taskId: string): Promise<TaskResult> {
    const data = await this.request(`/task/${taskId}`);
    
    return {
      task_id: taskId,
      status: data.data.status,
      progress: data.data.progress,
      output: data.data.output ? {
        model_url: data.data.output.model,
        texture_urls: data.data.output.pbr_model ? {
          base_color: data.data.output.base_color,
          metallic: data.data.output.metallic,
          roughness: data.data.output.roughness,
          normal: data.data.output.normal,
        } : undefined,
        thumbnail_url: data.data.output.rendered_image,
        pbr_model_url: data.data.output.pbr_model,
        rigged_model_url: data.data.output.rigged_model,
      } : undefined,
      error: data.data.status === 'failed' ? data.data.message : undefined,
    };
  }

  /**
   * 等待任务完成
   */
  async waitForCompletion(taskId: string, maxWaitMs = 300000): Promise<TaskResult> {
    const startTime = Date.now();
    const pollInterval = 3000; // 3秒轮询一次

    while (Date.now() - startTime < maxWaitMs) {
      const result = await this.getTaskStatus(taskId);
      
      if (result.status === 'success' || result.status === 'failed') {
        return result;
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Task timeout');
  }

  /**
   * 下载模型到指定格式
   */
  async downloadModel(taskId: string, format: OutputFormat = 'glb'): Promise<string> {
    const data = await this.request(`/task/${taskId}/download`, {
      method: 'POST',
      body: JSON.stringify({ format }),
    });

    return data.data.download_url;
  }

  /**
   * 骨骼绑定 (对已生成的模型)
   */
  async rigModel(originalTaskId: string): Promise<TaskResult> {
    const data = await this.request('/task', {
      method: 'POST',
      body: JSON.stringify({
        type: 'rig',
        original_model_task_id: originalTaskId,
      }),
    });

    return {
      task_id: data.data.task_id,
      status: 'queued',
    };
  }

  /**
   * 构建高级选项
   * 根据 Tripo3D 2025 API 文档
   */
  private buildOptions(options: Partial<GenerationConfig>) {
    const result: Record<string, unknown> = {};

    // 纹理设置
    // texture=false 且 pbr=false = 无纹理 (7积分)
    // 默认 = 标准纹理 (10-20积分)
    // texture_quality=detailed = 高清纹理 (20-30积分)
    if (options.texture === false) {
      result.texture = false;
      result.pbr = false;
    } else {
      // 默认启用纹理和 PBR
      result.texture = true;
      result.pbr = true;
      
      if (options.texture_quality === 'detailed') {
        result.texture_quality = 'detailed';
      }
    }

    // 面数限制
    if (options.face_limit) {
      result.face_limit = options.face_limit;
    }

    // 四边形拓扑 (+5积分)
    if (options.quad) {
      result.quad = true;
    }

    // 风格化 (+5积分)
    if (options.style) {
      result.style = options.style;
    }

    return result;
  }

  /**
   * 获取账户余额
   */
  async getBalance(): Promise<{ balance: number; used: number }> {
    const data = await this.request('/user/balance');
    return {
      balance: data.data.balance,
      used: data.data.used,
    };
  }

  /**
   * 获取任务列表
   */
  async listTasks(limit = 20, offset = 0): Promise<TaskResult[]> {
    const data = await this.request(`/task?limit=${limit}&offset=${offset}`);
    return data.data.tasks.map((task: any) => ({
      task_id: task.task_id,
      status: task.status,
      progress: task.progress,
      created_at: task.created_at,
      finished_at: task.finished_at,
    }));
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string): Promise<boolean> {
    try {
      await this.request(`/task/${taskId}/cancel`, { method: 'POST' });
      return true;
    } catch {
      return false;
    }
  }
}

// 导出单例
export const tripo3d = new Tripo3DService();

// 导出便捷函数
export const textToModel = (prompt: string, options?: Partial<GenerationConfig>) => 
  tripo3d.textToModel(prompt, options);

export const imageToModel = (imageUrl: string, options?: Partial<GenerationConfig>) => 
  tripo3d.imageToModel(imageUrl, options);

export const multiviewToModel = (imageUrls: string[], options?: Partial<GenerationConfig>) => 
  tripo3d.multiviewToModel(imageUrls, options);

export const doodleToModel = (imageUrl: string, stylePrompt?: string, options?: Partial<GenerationConfig>) =>
  tripo3d.doodleToModel(imageUrl, stylePrompt, options);

export const getTaskStatus = (taskId: string) => 
  tripo3d.getTaskStatus(taskId);

export const waitForCompletion = (taskId: string, maxWaitMs?: number) => 
  tripo3d.waitForCompletion(taskId, maxWaitMs);

export const isTripoConfigured = () => tripo3d.isReady();
