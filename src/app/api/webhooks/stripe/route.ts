import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { StripeService } from '@/lib/stripe/service';
import { createAdminClient } from '@/lib/supabase/server';
import { AdminService } from '@/lib/admin/service';
import type Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// 生产环境日志
const log = {
  info: (msg: string, data?: any) => console.log(`[Stripe Webhook] ${msg}`, data ? JSON.stringify(data) : ''),
  error: (msg: string, error?: any) => console.error(`[Stripe Webhook] ERROR: ${msg}`, error),
  warn: (msg: string, data?: any) => console.warn(`[Stripe Webhook] WARN: ${msg}`, data ? JSON.stringify(data) : ''),
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    log.error('Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    log.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    log.error('Webhook signature verification failed', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  log.info('Received event', { type: event.type, id: event.id });

  try {
    switch (event.type) {
      // ═══════════════════════════════════════════════════════════════
      // 支付完成
      // ═══════════════════════════════════════════════════════════════
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // 获取促销码信息
        let promoCode: string | undefined;
        let discountAmountCents = 0;
        const finalAmountCents = session.amount_total || 0;
        
        // 检查是否使用了促销码
        if (session.total_details?.breakdown?.discounts) {
          for (const discount of session.total_details.breakdown.discounts) {
            discountAmountCents += discount.amount;
            // 获取促销码名称
            if (discount.discount?.promotion_code) {
              try {
                const promoCodeId = typeof discount.discount.promotion_code === 'string' 
                  ? discount.discount.promotion_code 
                  : discount.discount.promotion_code;
                const promoCodeObj = await stripe.promotionCodes.retrieve(promoCodeId as string);
                promoCode = promoCodeObj.code;
              } catch (e) {
                log.warn('Failed to retrieve promo code', e);
              }
            }
          }
        }
        
        log.info('Payment details', { 
          sessionId: session.id, 
          promoCode, 
          discountAmountCents, 
          finalAmountCents 
        });
        
        // 更新支付意向状态为已完成，包含促销码信息
        await AdminService.updatePaymentIntentStatus(session.id, 'completed', {
          promoCode,
          discountAmountCents,
          finalAmountCents,
        });
        
        if (session.mode === 'payment') {
          log.info('Processing one-time payment', { sessionId: session.id });
          await StripeService.handleCheckoutCompleted(session);
        } else if (session.mode === 'subscription') {
          log.info('Subscription created', { 
            sessionId: session.id, 
            subscriptionId: session.subscription 
          });
          // 创建订阅记录
          await handleSubscriptionCreated(session);
        }
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // 支付会话过期
      // ═══════════════════════════════════════════════════════════════
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        log.info('Checkout session expired', { sessionId: session.id });
        await AdminService.updatePaymentIntentStatus(session.id, 'expired');
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // 发票支付成功 (订阅续费)
      // ═══════════════════════════════════════════════════════════════
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } };
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription?.id;
        log.info('Invoice paid', { 
          invoiceId: invoice.id, 
          subscriptionId,
          amount: invoice.amount_paid 
        });
        await StripeService.handleInvoicePaid(invoice as Stripe.Invoice);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // 发票支付失败
      // ═══════════════════════════════════════════════════════════════
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } };
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription?.id;
        log.warn('Invoice payment failed', { 
          invoiceId: invoice.id, 
          subscriptionId 
        });
        await handlePaymentFailed(invoice as Stripe.Invoice);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // 订阅状态更新
      // ═══════════════════════════════════════════════════════════════
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        log.info('Subscription updated', { 
          subscriptionId: subscription.id, 
          status: subscription.status 
        });
        await handleSubscriptionUpdated(subscription);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // 订阅取消
      // ═══════════════════════════════════════════════════════════════
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        log.info('Subscription cancelled', { subscriptionId: subscription.id });
        await handleSubscriptionDeleted(subscription);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // 退款
      // ═══════════════════════════════════════════════════════════════
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        log.info('Charge refunded', { chargeId: charge.id, amount: charge.amount_refunded });
        await handleRefund(charge);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // 争议 (Dispute)
      // ═══════════════════════════════════════════════════════════════
      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        log.warn('Dispute created', { disputeId: dispute.id, chargeId: dispute.charge });
        // 可以发送通知给管理员
        break;
      }

      default:
        log.info(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    log.error('Webhook handler error', { error: error.message, eventType: event.type });
    // 返回 200 避免 Stripe 重试，但记录错误
    return NextResponse.json({ received: true, error: error.message });
  }
}

// ═══════════════════════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════════════════════

async function handleSubscriptionCreated(session: Stripe.Checkout.Session) {
  // 重要: 使用 Admin 客户端绕过 RLS
  const supabase = await createAdminClient();
  const { userId, packageId } = session.metadata || {};
  
  if (!userId || !session.subscription) return;

  // 获取订阅详情
  const subscriptionId = typeof session.subscription === 'string' 
    ? session.subscription 
    : session.subscription.id;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // 查找套餐
  const { data: pkg } = await supabase
    .from('credit_packages')
    .select('id')
    .eq('name', packageId === 'proMonthly' ? 'Pro Monthly' : 'Team Monthly')
    .single();

  // 获取订阅周期
  const periodStart = subscription.items.data[0]?.current_period_start || subscription.created;
  const periodEnd = subscription.items.data[0]?.current_period_end || subscription.created + 30 * 24 * 60 * 60;

  // 创建订阅记录
  await supabase.from('subscriptions').insert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
    package_id: pkg?.id,
    status: subscription.status,
    current_period_start: new Date(periodStart * 1000).toISOString(),
    current_period_end: new Date(periodEnd * 1000).toISOString(),
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // 重要: 使用 Admin 客户端绕过 RLS
  const supabase = await createAdminClient();
  
  // 获取订阅周期
  const periodStart = subscription.items.data[0]?.current_period_start || subscription.created;
  const periodEnd = subscription.items.data[0]?.current_period_end || subscription.created + 30 * 24 * 60 * 60;
  
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(periodStart * 1000).toISOString(),
      current_period_end: new Date(periodEnd * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // 重要: 使用 Admin 客户端绕过 RLS
  const supabase = await createAdminClient();
  
  await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // 重要: 使用 Admin 客户端绕过 RLS
  const supabase = await createAdminClient();
  
  // 从 invoice 对象中获取 subscription (使用 any 绕过类型检查)
  const invoiceData = invoice as any;
  const subscriptionId = typeof invoiceData.subscription === 'string' 
    ? invoiceData.subscription 
    : invoiceData.subscription?.id;
  
  if (!subscriptionId) return;
  
  // 查找用户
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (sub) {
    // 可以发送邮件通知用户支付失败
    log.warn('Payment failed for user', { userId: sub.user_id });
  }
}

async function handleRefund(charge: Stripe.Charge) {
  // 退款处理 - 可以扣除相应积分
  // 这里需要根据业务逻辑决定是否扣除积分
  log.info('Refund processed', { 
    chargeId: charge.id, 
    amountRefunded: charge.amount_refunded 
  });
}

// Stripe webhooks 需要原始 body，禁用 body 解析
export const config = {
  api: {
    bodyParser: false,
  },
};
