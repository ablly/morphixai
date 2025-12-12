import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const COST_DOWNLOAD = 5;

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { generationId } = body;

        if (!generationId) {
            return NextResponse.json({ error: 'Missing generation ID' }, { status: 400 });
        }

        // 1. Get generation and verify ownership
        const { data: generation, error: genError } = await supabase
            .from('generations')
            .select('id, user_id, model_url, is_downloaded')
            .eq('id', generationId)
            .eq('user_id', user.id)
            .single();

        if (genError || !generation) {
            return NextResponse.json({ error: 'Generation not found' }, { status: 404 });
        }

        if (!generation.model_url) {
            return NextResponse.json({ error: 'Model not ready yet' }, { status: 400 });
        }

        // 2. Get user profile to check plan
        const { data: profile } = await supabase
            .from('profiles')
            .select('plan_tier')
            .eq('id', user.id)
            .single();

        // 3. Check if user needs to pay (Starter or Free)
        const isFreeDownload = profile?.plan_tier === 'creator' || profile?.plan_tier === 'pro';

        if (!isFreeDownload && !generation.is_downloaded) {
            // First-time download for Starter/Free user, charge credits
            const { data: userCredits } = await supabase
                .from('user_credits')
                .select('balance')
                .eq('user_id', user.id)
                .single();

            if (!userCredits || userCredits.balance < COST_DOWNLOAD) {
                return NextResponse.json({
                    error: 'Insufficient credits for download',
                    required: COST_DOWNLOAD,
                    balance: userCredits?.balance || 0
                }, { status: 402 });
            }

            const { error: transactionError } = await supabase.rpc('deduct_credits', {
                p_user_id: user.id,
                p_amount: COST_DOWNLOAD,
                p_description: `Downloaded model ${generationId}`,
                p_reference_id: generationId
            });

            if (transactionError) {
                return NextResponse.json({ error: 'Transaction failed: ' + transactionError.message }, { status: 500 });
            }
        }

        // 4. Mark as downloaded (only on first download)
        if (!generation.is_downloaded) {
            const { error: updateError } = await supabase
                .from('generations')
                .update({ is_downloaded: true })
                .eq('id', generationId);

            if (updateError) {
                console.error('Failed to mark as downloaded:', updateError);
                // Non-critical, continue
            }
        }

        return NextResponse.json({
            success: true,
            modelUrl: generation.model_url,
            charged: !isFreeDownload && !generation.is_downloaded
        });

    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

