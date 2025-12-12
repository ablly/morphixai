import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreditsService, calculateTotalCost, type GenerationMode, type AdvancedOption } from '@/lib/credits/service';
import { checkRateLimit } from '@/lib/rate-limit';
import * as fal from "@fal-ai/serverless-client";

// Configure Fal.ai with API Key
fal.config({
  credentials: process.env.FAL_KEY,
});

const log = {
  info: (msg: string, data?: any) => console.log(`[Generate] ${msg}`, data ? JSON.stringify(data) : ''),
  error: (msg: string, error?: any) => console.error(`[Generate] ERROR: ${msg}`, error),
};

// SAM-3 API Endpoints
// Documentation: https://fal.ai/models/fal-ai/sam-3/3d-objects/api
//                https://fal.ai/models/fal-ai/sam-3/3d-body/api
const SAM3_ENDPOINTS = {
  OBJECT: 'fal-ai/sam-3/3d-objects',  // For general objects
  BODY: 'fal-ai/sam-3/3d-body',       // For human bodies
} as const;

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
      }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const mode = (formData.get('mode') as GenerationMode) || 'OBJECT';

    // Advanced Options
    const isPrivate = formData.get('isPrivate') === 'true';
    const isPriority = formData.get('isPriority') === 'true';

    // Validate Input
    if (!file) {
      return NextResponse.json({ error: 'Image is required', code: 'MISSING_IMAGE' }, { status: 400 });
    }

    // Calculate Cost
    const advancedOptions: AdvancedOption[] = [];
    if (isPrivate) advancedOptions.push('PRIVATE_MODE');
    if (isPriority) advancedOptions.push('PRIORITY_QUEUE');

    const creditsRequired = calculateTotalCost(mode, 'STANDARD', advancedOptions);

    // Check Balance
    const balance = await CreditsService.getBalance(user.id);
    if (balance < creditsRequired) {
      return NextResponse.json({ error: 'Insufficient credits', required: creditsRequired, balance }, { status: 402 });
    }

    // Upload Image to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('generations').upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from('generations').getPublicUrl(fileName);
    const sourceImageUrl = urlData.publicUrl;

    // Deduct Credits
    const deductResult = await CreditsService.deductCredits(
      user.id,
      creditsRequired,
      `3D Generation (${mode})`
    );

    if (!deductResult.success) {
      return NextResponse.json({ error: deductResult.error }, { status: 402 });
    }

    // Select SAM-3 endpoint based on mode
    // OBJECT mode -> fal-ai/sam-3/3d-objects (for general objects, products, etc.)
    // BODY mode -> fal-ai/sam-3/3d-body (for human bodies, characters)
    const endpoint = mode === 'BODY' ? SAM3_ENDPOINTS.BODY : SAM3_ENDPOINTS.OBJECT;
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/fal`;

    log.info('Calling Fal.ai SAM-3', { 
      endpoint, 
      mode, 
      webhookUrl,
      imageUrl: sourceImageUrl.substring(0, 50) + '...'
    });

    // SAM-3 API Input Parameters
    // Based on Fal.ai standard image-to-3D API pattern
    // Reference: https://fal.ai/models/fal-ai/sam-3/3d-objects/api
    const falInput: Record<string, unknown> = {
      image_url: sourceImageUrl,
    };

    // Submit to Fal.ai Queue with webhook
    const falResult = await fal.queue.submit(endpoint, {
      input: falInput,
      webhookUrl: webhookUrl,
    });

    log.info('Fal.ai request submitted', { 
      requestId: falResult.request_id,
      endpoint 
    });

    // Create Generation Record in Database
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        source_image_url: sourceImageUrl,
        engine: 'fal-ai-sam3',
        status: 'PROCESSING',
        credits_used: creditsRequired,
        fal_request_id: falResult.request_id,
        is_private: isPrivate,
        mode: mode,
        metadata: { 
          mode, 
          isPriority, 
          endpoint,
          falInput,
        },
      })
      .select()
      .single();

    if (genError) {
      log.error('Failed to create generation record', genError);
      // Refund credits on database error
      await CreditsService.refundCredits(user.id, creditsRequired, 'failed_db_insert');
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      generationId: generation.id,
      creditsUsed: creditsRequired,
      newBalance: deductResult.newBalance,
      status: 'PROCESSING',
      endpoint: endpoint,
    });

  } catch (error: any) {
    log.error('Generation error', error);
    
    // Handle specific Fal.ai errors
    if (error.status === 403) {
      return NextResponse.json({ 
        error: 'Fal.ai API access denied. Please check billing at https://fal.ai/dashboard/billing',
        code: 'FAL_FORBIDDEN'
      }, { status: 503 });
    }
    
    if (error.status === 401) {
      return NextResponse.json({ 
        error: 'Fal.ai API key invalid. Please check FAL_KEY configuration.',
        code: 'FAL_UNAUTHORIZED'
      }, { status: 503 });
    }

    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

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
      const { data: generation, error } = await supabase
        .from('generations')
        .select('*')
        .eq('id', generationId)
        .eq('user_id', user.id)
        .single();

      if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      // If still processing, check Fal status (optional, if webhook fails)
      if (generation.status === 'PROCESSING' && generation.fal_request_id) {
        try {
          const status = await fal.queue.status('fal-ai/sam-3d-objects', { requestId: generation.fal_request_id }); // Endpoint doesn't matter for status check usually

          if (status.status === 'COMPLETED') {
            // Update DB
            const modelUrl = status.logs?.find(l => l.message.includes('http'))?.message || (status as any).output?.model_mesh?.value;
            // Note: Fal output structure varies. Usually it's in `output`.
            // Let's assume webhook handles it primarily, but if we check here, we should update.
            // For now, let's rely on the frontend polling the DB, and the webhook updating the DB.
            // If webhook is slow, user waits. 
            // To make it robust, I'll just return the DB status.
          }
        } catch (e) {
          // ignore fal check error
        }
      }

      return NextResponse.json(generation);
    } else {
      const { data } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return NextResponse.json(data);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
