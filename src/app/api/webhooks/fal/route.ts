import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreditsService } from '@/lib/credits/service';

// Fal.ai webhook secret (optional but recommended for production)
const FAL_WEBHOOK_SECRET = process.env.FAL_WEBHOOK_SECRET;

/**
 * Extract model URL from Fal.ai SAM-3 webhook payload
 * SAM-3 API Response Structure (based on Fal.ai standard patterns):
 * - fal-ai/sam-3/3d-objects: { model_mesh: { url: "..." } } or { mesh: { url: "..." } }
 * - fal-ai/sam-3/3d-body: { model_mesh: { url: "..." } } or { body_mesh: { url: "..." } }
 */
function extractModelUrl(result: any, logs?: any[]): string | null {
    if (!result) return null;

    // SAM-3 standard output patterns
    const urlPaths = [
        // Primary SAM-3 output fields
        result?.model_mesh?.url,
        result?.mesh?.url,
        result?.body_mesh?.url,
        result?.model?.url,
        // Nested output structure
        result?.output?.model_mesh?.url,
        result?.output?.mesh?.url,
        result?.output?.model?.url,
        // Alternative field names
        result?.glb?.url,
        result?.file?.url,
        result?.model_mesh?.value,
        // Direct URL field
        result?.url,
    ];

    // Find first valid URL
    for (const url of urlPaths) {
        if (url && typeof url === 'string' && url.startsWith('http')) {
            return url;
        }
    }

    // Fallback: search in logs for .glb or .obj URLs
    if (logs && Array.isArray(logs)) {
        for (const log of logs) {
            if (log?.message) {
                const urlMatch = log.message.match(/https?:\/\/[^\s"]+\.(glb|obj|gltf)/i);
                if (urlMatch) return urlMatch[0];
            }
        }
    }

    // Last resort: deep search in result object for any .glb URL
    const resultStr = JSON.stringify(result);
    const glbMatch = resultStr.match(/https?:\/\/[^"\\]+\.glb/i);
    if (glbMatch) return glbMatch[0];

    const objMatch = resultStr.match(/https?:\/\/[^"\\]+\.obj/i);
    if (objMatch) return objMatch[0];

    return null;
}

export async function POST(request: NextRequest) {
    try {
        // Optional: Verify webhook signature if FAL_WEBHOOK_SECRET is set
        if (FAL_WEBHOOK_SECRET) {
            const signature = request.headers.get('x-fal-signature');
            if (!signature) {
                console.warn('[Fal Webhook] Missing signature header');
            }
        }

        const payload = await request.json();
        const { request_id, status, payload: result, error } = payload;

        console.log('[Fal Webhook] Received:', { 
            request_id, 
            status,
            hasPayload: !!result,
            hasError: !!error 
        });

        if (!request_id) {
            return NextResponse.json({ error: 'Missing request_id' }, { status: 400 });
        }

        const supabase = await createClient();

        // Find the generation record
        const { data: generation, error: fetchError } = await supabase
            .from('generations')
            .select('*')
            .eq('fal_request_id', request_id)
            .single();

        if (fetchError || !generation) {
            console.error('[Fal Webhook] Generation not found:', request_id);
            return NextResponse.json({ error: 'Generation not found' }, { status: 404 });
        }

        // Handle successful completion
        if (status === 'OK' || status === 'COMPLETED') {
            const modelUrl = extractModelUrl(result, payload.logs);

            console.log('[Fal Webhook] Extracted model URL:', modelUrl);
            console.log('[Fal Webhook] Full result preview:', JSON.stringify(result).substring(0, 800));

            if (modelUrl) {
                await supabase
                    .from('generations')
                    .update({
                        status: 'COMPLETED',
                        model_url: modelUrl,
                        completed_at: new Date().toISOString(),
                        metadata: {
                            ...generation.metadata,
                            fal_response: result,
                        },
                    })
                    .eq('id', generation.id);

                console.log('[Fal Webhook] Generation completed successfully:', generation.id);
            } else {
                // Model URL not found - log full payload for debugging
                console.error('[Fal Webhook] Model URL not found in payload');
                console.error('[Fal Webhook] Full payload:', JSON.stringify(payload));

                await supabase
                    .from('generations')
                    .update({
                        status: 'FAILED',
                        error_message: 'Model URL missing in webhook payload. Check logs for details.',
                        completed_at: new Date().toISOString(),
                        metadata: {
                            ...generation.metadata,
                            fal_response: result,
                            debug_payload: payload,
                        },
                    })
                    .eq('id', generation.id);

                // Refund credits
                await CreditsService.refundCredits(
                    generation.user_id, 
                    generation.credits_used, 
                    'webhook_missing_url'
                );
            }

        } else if (status === 'ERROR' || status === 'FAILED') {
            // Handle failure
            const errorMessage = error || payload.error_message || 'Unknown error from Fal.ai';
            console.error('[Fal Webhook] Generation failed:', errorMessage);

            await supabase
                .from('generations')
                .update({
                    status: 'FAILED',
                    error_message: errorMessage,
                    completed_at: new Date().toISOString(),
                })
                .eq('id', generation.id);

            // Refund credits on failure
            await CreditsService.refundCredits(
                generation.user_id, 
                generation.credits_used, 
                'fal_generation_failed'
            );
        } else {
            // Unknown status - log for debugging
            console.warn('[Fal Webhook] Unknown status:', status);
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Fal Webhook] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
