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
    
    // 获取支付意向列表
    const paymentIntents = await stripe.paymentIntents.list({
      limit,
      starting_after: startingAfter,
      expand: ['data.customer', 'data.latest_charge'],
    });

    // 获取最近的checkout sessions来匹配促销码
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ['data.total_details'],
    });

    // 创建session映射
    const sessionMap = new Map<string, any>();
    for (const session of sessions.data) {
      if (session.payment_intent) {
        const piId = typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : session.payment_intent.id;
        sessionMap.set(piId, session);
      }
    }

    // 格式化数据
    const payments = await Promise.all(paymentIntents.data.map(async (pi) => {
      const session = sessionMap.get(pi.id);
      let promoCode: string | null = null;
      let discountAmount = 0;
      
      // 尝试获取促销码信息
      if (session?.total_details?.breakdown?.discounts) {
        for (const discount of session.total_details.breakdown.discounts) {
          discountAmount += discount.amount;
          if (discount.discount?.promotion_code) {
            try {
              const promoId = typeof discount.discount.promotion_code === 'string'
                ? discount.discount.promotion_code
                : discount.discount.promotion_code;
              const promo = await stripe.promotionCodes.retrieve(promoId);
              promoCode = promo.code;
            } catch (e) {
              // ignore
            }
          }
        }
      }

      const customer = pi.customer;
      let customerEmail: string | null = null;
      let customerName: string | null = null;
      
      if (customer && typeof customer !== 'string' && 'email' in customer) {
        customerEmail = customer.email || null;
        customerName = customer.name || null;
      }

      // 获取charge信息
      const charge = pi.latest_charge;
      let receiptUrl: string | null = null;
      if (charge && typeof charge !== 'string') {
        receiptUrl = charge.receipt_url;
      }

      return {
        id: pi.id,
        amount: pi.amount,
        currency: pi.currency,
        status: pi.status,
        created: pi.created,
        customerEmail,
        customerName,
        metadata: pi.metadata,
        promoCode,
        discountAmount,
        originalAmount: pi.amount + discountAmount,
        receiptUrl,
        description: pi.description,
      };
    }));

    return NextResponse.json({
      payments,
      hasMore: paymentIntents.has_more,
      lastId: payments.length > 0 ? payments[payments.length - 1].id : null,
    });
  } catch (error: any) {
    console.error('[Admin Stripe] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Stripe payments' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
