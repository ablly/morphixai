import { stripe } from './server';
import { createClient } from '@/lib/supabase/server';
import type Stripe from 'stripe';

// 积分套餐配置 (价格策略：高套餐单价更低，鼓励大额购买)
export const CREDIT_PACKAGES = {
  starter: { credits: 20, priceUsd: 4.99 },    // $0.25/积分
  basic: { credits: 100, priceUsd: 14.99 },    // $0.15/积分 (省40%)
  standard: { credits: 300, priceUsd: 29.99 }, // $0.10/积分 (省60%)
  pro: { credits: 1000, priceUsd: 79.99 },     // $0.08/积分 (省68%)
} as const;

// 订阅套餐配置
export const SUBSCRIPTION_PACKAGES = {
  proMonthly: { credits: 200, priceUsd: 19.99 },  // $0.10/积分
  teamMonthly: { credits: 500, priceUsd: 39.99 }, // $0.08/积分
} as const;

export const FIRST_PURCHASE_DISCOUNT = 0.85; // 首单 85 折

export class StripeService {
  /**
   * 检查用户是否为首次购买
   */
  static async isFirstPurchase(userId: string): Promise<boolean> {
    const supabase = await createClient();
    
    const { data } = await supabase
      .from('profiles')
      .select('first_purchase_used')
      .eq('id', userId)
      .single();

    return !data?.first_purchase_used;
  }

  /**
   * 标记首次购买已使用
   */
  static async markFirstPurchaseUsed(userId: string): Promise<void> {
    const supabase = await createClient();
    
    await supabase
      .from('profiles')
      .update({ first_purchase_used: true })
      .eq('id', userId);
  }

  /**
   * 创建 Checkout Session (一次性购买)
   */
  static async createCheckoutSession(
    userId: string,
    userEmail: string,
    packageId: keyof typeof CREDIT_PACKAGES,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId: string; url: string } | null> {
    const pkg = CREDIT_PACKAGES[packageId];
    if (!pkg) return null;

    const isFirst = await this.isFirstPurchase(userId);
    const finalPrice = isFirst 
      ? Math.round(pkg.priceUsd * FIRST_PURCHASE_DISCOUNT * 100) 
      : Math.round(pkg.priceUsd * 100);

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${packageId.charAt(0).toUpperCase() + packageId.slice(1)} Credits Pack`,
                description: `${pkg.credits} credits for Morphix AI`,
              },
              unit_amount: finalPrice,
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId,
          packageId,
          credits: pkg.credits.toString(),
          isFirstPurchase: isFirst.toString(),
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return {
        sessionId: session.id,
        url: session.url!,
      };
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      return null;
    }
  }

  /**
   * 创建订阅 Checkout Session
   */
  static async createSubscriptionSession(
    userId: string,
    userEmail: string,
    packageId: keyof typeof SUBSCRIPTION_PACKAGES,
    stripePriceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId: string; url: string } | null> {
    const pkg = SUBSCRIPTION_PACKAGES[packageId];
    if (!pkg) return null;

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: userEmail,
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        metadata: {
          userId,
          packageId,
          monthlyCredits: pkg.credits.toString(),
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return {
        sessionId: session.id,
        url: session.url!,
      };
    } catch (error) {
      console.error('Failed to create subscription session:', error);
      return null;
    }
  }

  /**
   * 处理 Webhook: checkout.session.completed
   */
  static async handleCheckoutCompleted(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    const { userId, packageId, credits, isFirstPurchase } = session.metadata || {};
    
    if (!userId || !credits) {
      console.error('Missing metadata in checkout session');
      return;
    }

    const supabase = await createClient();
    const creditAmount = parseInt(credits, 10);

    // 添加积分
    const { data: currentCredits } = await supabase
      .from('user_credits')
      .select('balance, total_earned')
      .eq('user_id', userId)
      .single();

    const newBalance = (currentCredits?.balance ?? 0) + creditAmount;
    const newTotalEarned = (currentCredits?.total_earned ?? 0) + creditAmount;

    await supabase
      .from('user_credits')
      .update({ 
        balance: newBalance,
        total_earned: newTotalEarned,
      })
      .eq('user_id', userId);

    // 记录交易
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      type: 'PURCHASE',
      amount: creditAmount,
      balance_after: newBalance,
      description: `Purchased ${packageId} package (${creditAmount} credits)`,
      reference_id: session.id,
    });

    // 标记首次购买已使用
    if (isFirstPurchase === 'true') {
      await this.markFirstPurchaseUsed(userId);
    }
  }

  /**
   * 处理 Webhook: invoice.paid (订阅续费)
   */
  static async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const subscription = (invoice as any).subscription as string;
    if (!subscription) return;

    const supabase = await createClient();

    // 查找订阅记录
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('user_id, package_id')
      .eq('stripe_subscription_id', subscription)
      .single();

    if (!sub) return;

    // 查找套餐积分数
    const { data: pkg } = await supabase
      .from('credit_packages')
      .select('credits')
      .eq('id', sub.package_id)
      .single();

    if (!pkg) return;

    // 添加月度积分
    const { data: currentCredits } = await supabase
      .from('user_credits')
      .select('balance, total_earned')
      .eq('user_id', sub.user_id)
      .single();

    const newBalance = (currentCredits?.balance ?? 0) + pkg.credits;
    const newTotalEarned = (currentCredits?.total_earned ?? 0) + pkg.credits;

    await supabase
      .from('user_credits')
      .update({ 
        balance: newBalance,
        total_earned: newTotalEarned,
      })
      .eq('user_id', sub.user_id);

    // 记录交易
    await supabase.from('credit_transactions').insert({
      user_id: sub.user_id,
      type: 'SUBSCRIPTION',
      amount: pkg.credits,
      balance_after: newBalance,
      description: `Monthly subscription credits`,
      reference_id: invoice.id,
    });
  }

  /**
   * 取消订阅
   */
  static async cancelSubscription(
    subscriptionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      const supabase = await createClient();
      await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('stripe_subscription_id', subscriptionId);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取用户订阅状态
   */
  static async getUserSubscription(userId: string) {
    const supabase = await createClient();

    const { data } = await supabase
      .from('subscriptions')
      .select('*, credit_packages(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    return data;
  }
}
