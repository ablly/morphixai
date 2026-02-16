import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { AdminService } from '@/lib/admin/service';
import { createAdminClient } from '@/lib/supabase/server';

// 从 Stripe 同步支付数据到 payment_intents 表
export async function POST() {
  try {
    await AdminService.requireAdmin();
    const supabase = await createAdminClient();

    // 获取所有 Stripe checkout sessions
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ['data.total_details.breakdown'],
    });

    let synced = 0;
    let skipped = 0;
    let errors = 0;

    for (const session of sessions.data) {
      const userId = session.metadata?.userId;
      const packageId = session.metadata?.packageId;
      
      if (!userId || !packageId) {
        skipped++;
        continue;
      }

      // 检查是否已存在
      const { data: existing } = await supabase
        .from('payment_intents')
        .select('id')
        .eq('stripe_session_id', session.id)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      // 确定状态
      let status = 'pending';
      if (session.payment_status === 'paid') {
        status = 'completed';
      } else if (session.status === 'expired') {
        status = 'expired';
      }

      // 获取促销码信息
      let promoCode: string | null = null;
      let discountAmountCents = 0;
      if (session.total_details?.breakdown?.discounts) {
        for (const discount of session.total_details.breakdown.discounts) {
          discountAmountCents += discount.amount;
          if (discount.discount?.promotion_code) {
            try {
              const pc = discount.discount.promotion_code;
              if (typeof pc === 'string') {
                const promo = await stripe.promotionCodes.retrieve(pc);
                promoCode = promo.code;
              } else {
                promoCode = pc.code;
              }
            } catch { /* ignore */ }
          }
        }
      }

      const { error } = await supabase
        .from('payment_intents')
        .insert({
          user_id: userId,
          stripe_session_id: session.id,
          package_id: packageId,
          amount_cents: session.amount_subtotal || 0,
          status,
          created_at: new Date(session.created * 1000).toISOString(),
          completed_at: status === 'completed' ? new Date(session.created * 1000).toISOString() : null,
          promo_code: promoCode,
          discount_amount_cents: discountAmountCents || 0,
          final_amount_cents: session.amount_total || null,
        });

      if (error) {
        console.error('[Sync] Failed to insert:', session.id, error.message);
        errors++;
      } else {
        synced++;
        console.log('[Sync] Synced:', session.id, packageId, status);
      }
    }

    return NextResponse.json({ synced, skipped, errors, total: sessions.data.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    console.error('[Sync] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
