import { stripe } from './server';
import { createAdminClient } from '@/lib/supabase/server';
import type Stripe from 'stripe';

// 积分套餐配置 (Fal.ai SAM 3D 策略: 高利润率)
// 成本: $0.02/生成, 售价: $0.09/生成 (9积分), 利润率: 350%
export const CREDIT_PACKAGES = {
  starter: { credits: 1000, priceUsd: 9.90 },   // ~110 models, $0.0099/credit
  creator: { credits: 3500, priceUsd: 29.90 },  // ~380 models, $0.0085/credit (15% off)
  pro: { credits: 12000, priceUsd: 99.90 },     // ~1330 models, $0.0083/credit (20% off)
} as const;

// 订阅套餐配置 (暂时禁用，专注于积分包)
export const SUBSCRIPTION_PACKAGES = {
  proMonthly: { credits: 200, priceUsd: 19.99 },
  teamMonthly: { credits: 500, priceUsd: 39.99 },
} as const;

export const FIRST_PURCHASE_DISCOUNT = 0.85; // 首单 85 折

export class StripeService {
  /**
   * 检查用户是否为首次购买
   */
  static async isFirstPurchase(userId: string): Promise<boolean> {
    const supabase = await createAdminClient();
    
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
    const supabase = await createAdminClient();
    
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
    if (!pkg) {
      console.error('Invalid package ID:', packageId);
      return null;
    }

    const isFirst = await this.isFirstPurchase(userId);
    const finalPrice = isFirst 
      ? Math.round(pkg.priceUsd * FIRST_PURCHASE_DISCOUNT * 100) 
      : Math.round(pkg.priceUsd * 100);

    // 套餐名称映射
    const packageNames: Record<string, string> = {
      starter: 'Starter',
      creator: 'Creator',
      pro: 'Pro',
    };

    // 套餐描述
    const packageDescriptions: Record<string, string> = {
      starter: `${pkg.credits} credits (~110 models) - The Hobbyist`,
      creator: `${pkg.credits} credits (~380 models) - The Pro`,
      pro: `${pkg.credits} credits (~1330 models) - The Studio`,
    };

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Morphix AI ${packageNames[packageId] || packageId} Pack`,
                description: packageDescriptions[packageId] || `${pkg.credits} credits for Morphix AI`,
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
   * 重要: 使用 Admin 客户端绕过 RLS，确保数据正确写入
   */
  static async handleCheckoutCompleted(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    const { userId, packageId, credits, isFirstPurchase } = session.metadata || {};
    
    if (!userId || !credits) {
      console.error('[Stripe] Missing metadata in checkout session:', session.id);
      return;
    }

    console.log('[Stripe] Processing checkout for user:', userId, 'credits:', credits, 'sessionId:', session.id);
    
    // 重要: 使用 Admin 客户端绕过 RLS
    const supabase = await createAdminClient();
    const creditAmount = parseInt(credits, 10);

    // 检查是否已经处理过这个 session (防止重复处理)
    const { data: existingTransaction } = await supabase
      .from('credit_transactions')
      .select('id')
      .eq('reference_id', session.id)
      .single();

    if (existingTransaction) {
      console.log('[Stripe] Session already processed, skipping:', session.id);
      return;
    }

    // 获取当前积分
    const { data: currentCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('balance, total_earned')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('[Stripe] Failed to fetch user credits:', fetchError);
      // 如果用户没有积分记录，创建一个
      if (fetchError.code === 'PGRST116') {
        console.log('[Stripe] Creating new credit record for user:', userId);
        const { error: insertError } = await supabase.from('user_credits').insert({
          user_id: userId,
          balance: creditAmount,
          total_earned: creditAmount,
          total_spent: 0,
        });
        if (insertError) {
          console.error('[Stripe] Failed to create credit record:', insertError);
          throw new Error(`Failed to create credit record: ${insertError.message}`);
        }
        // 记录交易
        await supabase.from('credit_transactions').insert({
          user_id: userId,
          type: 'PURCHASE',
          amount: creditAmount,
          balance_after: creditAmount,
          description: `Purchased ${packageId} package (${creditAmount} credits)`,
          reference_id: session.id,
        });
        console.log('[Stripe] Successfully created credit record and transaction for new user');
        return;
      }
      throw new Error(`Failed to fetch credits: ${fetchError.message}`);
    }

    const newBalance = (currentCredits?.balance ?? 0) + creditAmount;
    const newTotalEarned = (currentCredits?.total_earned ?? 0) + creditAmount;

    // 更新积分
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({ 
        balance: newBalance,
        total_earned: newTotalEarned,
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('[Stripe] Failed to update credits:', updateError);
      throw new Error(`Failed to update credits: ${updateError.message}`);
    }

    // 记录交易
    const { error: transactionError } = await supabase.from('credit_transactions').insert({
      user_id: userId,
      type: 'PURCHASE',
      amount: creditAmount,
      balance_after: newBalance,
      description: `Purchased ${packageId} package (${creditAmount} credits)`,
      reference_id: session.id,
    });

    if (transactionError) {
      console.error('[Stripe] Failed to record transaction:', transactionError);
      // 不抛出错误，因为积分已经添加成功
    }

    console.log('[Stripe] Successfully added', creditAmount, 'credits to user', userId, 'new balance:', newBalance);

    // 更新用户 plan_tier (根据购买的套餐)
    const planTierMap: Record<string, string> = {
      starter: 'starter',
      creator: 'creator',
      pro: 'pro',
    };
    
    const newPlanTier = planTierMap[packageId as string];
    if (newPlanTier) {
      // 只升级，不降级 (pro > creator > starter > free)
      const tierPriority: Record<string, number> = { free: 0, starter: 1, creator: 2, pro: 3 };
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan_tier')
        .eq('id', userId)
        .single();
      
      const currentTier = profile?.plan_tier || 'free';
      if (tierPriority[newPlanTier] > tierPriority[currentTier]) {
        await supabase
          .from('profiles')
          .update({ plan_tier: newPlanTier })
          .eq('id', userId);
        
        console.log(`[Stripe] Upgraded user ${userId} from ${currentTier} to ${newPlanTier}`);
      }
    }

    // 标记首次购买已使用
    if (isFirstPurchase === 'true') {
      await this.markFirstPurchaseUsed(userId);
    }
  }

  /**
   * 处理 Webhook: invoice.paid (订阅续费)
   * 重要: 使用 Admin 客户端绕过 RLS
   */
  static async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const subscription = (invoice as any).subscription as string;
    if (!subscription) return;

    console.log('[Stripe] Processing invoice paid for subscription:', subscription);
    
    // 重要: 使用 Admin 客户端绕过 RLS
    const supabase = await createAdminClient();

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

      const supabase = await createAdminClient();
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
    const supabase = await createAdminClient();

    const { data } = await supabase
      .from('subscriptions')
      .select('*, credit_packages(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    return data;
  }
}
