import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { AdminService } from '@/lib/admin/service';

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    await AdminService.requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const startingAfter = searchParams.get('starting_after') || undefined;

    // 直接获取checkout sessions - 这里有最完整的信息
    const sessions = await stripe.checkout.sessions.list({
      limit,
      starting_after: startingAfter,
      expand: ['data.line_items', 'data.total_details.breakdown'],
    });

    // 格式化数据
    const payments = await Promise.all(
      sessions.data.map(async (session) => {
        let promoCode: string | null = null;
        let discountAmount = 0;

        // 获取促销码信息
        if (session.total_details?.breakdown?.discounts) {
          for (const discount of session.total_details.breakdown.discounts) {
            discountAmount += discount.amount;
            if (discount.discount?.promotion_code) {
              try {
                const promoCodeObj = discount.discount.promotion_code;
                if (typeof promoCodeObj === 'string') {
                  const promo = await stripe.promotionCodes.retrieve(promoCodeObj);
                  promoCode = promo.code;
                } else {
                  promoCode = promoCodeObj.code;
                }
              } catch {
                // ignore
              }
            }
          }
        }

        // 获取收据URL
        let receiptUrl: string | null = null;
        if (session.payment_intent) {
          try {
            const piId =
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent.id;
            const pi = await stripe.paymentIntents.retrieve(piId, {
              expand: ['latest_charge'],
            });
            const charge = pi.latest_charge;
            if (charge && typeof charge !== 'string') {
              receiptUrl = charge.receipt_url;
            }
          } catch {
            // ignore
          }
        }

        // 获取套餐信息
        const packageId = session.metadata?.packageId || '-';
        const userId = session.metadata?.userId || '-';

        return {
          id: session.id,
          paymentIntentId:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id || null,
          amount: session.amount_total || 0,
          amountSubtotal: session.amount_subtotal || 0,
          currency: session.currency || 'usd',
          status: session.payment_status,
          sessionStatus: session.status,
          created: Math.floor(new Date(session.created * 1000).getTime() / 1000),
          customerEmail: session.customer_details?.email || session.customer_email || null,
          customerName: session.customer_details?.name || null,
          metadata: session.metadata || {},
          promoCode,
          discountAmount,
          originalAmount: (session.amount_subtotal || 0),
          receiptUrl,
          packageId,
          userId,
        };
      })
    );

    return NextResponse.json({
      payments,
      hasMore: sessions.has_more,
      lastId: payments.length > 0 ? payments[payments.length - 1].id : null,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[Admin Stripe] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch Stripe payments' },
      { status: err.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
