import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const COST_LICENSE = 100;

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

        // Check balance and deduct
        const { data: userCredits } = await supabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', user.id)
            .single();

        if (!userCredits || userCredits.balance < COST_LICENSE) {
            return NextResponse.json({ error: 'Insufficient credits for license' }, { status: 402 });
        }

        const { error: transactionError } = await supabase.rpc('deduct_credits', {
            p_user_id: user.id,
            p_amount: COST_LICENSE,
            p_description: `Purchased Commercial License for ${generationId}`,
            p_reference_id: generationId
        });

        if (transactionError) {
            return NextResponse.json({ error: 'Transaction failed' }, { status: 500 });
        }

        // Mark as licensed
        const { error: updateError } = await supabase
            .from('generations')
            .update({ has_license: true })
            .eq('id', generationId)
            .eq('user_id', user.id);

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update generation status' }, { status: 500 });
        }

        // Return URL to the printable license page (locale will be added by frontend)
        return NextResponse.json({ success: true, licenseUrl: `/license/${generationId}`, generationId });

    } catch (error) {
        console.error('License error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
