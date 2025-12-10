import { createClient } from '@/lib/supabase/server';
import type { TransactionType, CreditTransaction, UserCredits } from '@/lib/supabase/types';

// Re-export constants from the shared constants file (safe for client components)
export {
  GENERATION_COSTS,
  ADVANCED_OPTIONS_COSTS,
  SOCIAL_REWARDS,
  DAILY_SOCIAL_LIMIT,
  REFERRAL_REWARD,
  calculateTotalCost,
  type GenerationMode,
  type QualityLevel,
  type AdvancedOption,
} from './constants';

export class CreditsService {
  /**
   * 获取用户积分余额
   */
  static async getBalance(userId: string): Promise<number> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (error) throw new Error(`Failed to get balance: ${error.message}`);
    return data?.balance ?? 0;
  }

  /**
   * 获取用户积分详情
   */
  static async getCredits(userId: string): Promise<UserCredits | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * 扣除积分 (带事务保护)
   */
  static async deductCredits(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
    const supabase = await createClient();

    // 获取当前余额和总消费
    const { data: currentCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('balance, total_spent')
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !currentCredits) {
      return { 
        success: false, 
        newBalance: 0, 
        error: 'Failed to fetch credits' 
      };
    }

    const currentBalance = currentCredits.balance;
    
    if (currentBalance < amount) {
      return { 
        success: false, 
        newBalance: currentBalance, 
        error: 'Insufficient credits' 
      };
    }

    const newBalance = currentBalance - amount;
    const newTotalSpent = (currentCredits.total_spent || 0) + amount;

    // 更新余额
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({ 
        balance: newBalance,
        total_spent: newTotalSpent,
      })
      .eq('user_id', userId)
      .eq('balance', currentBalance); // 乐观锁，防止并发问题

    if (updateError) {
      return { 
        success: false, 
        newBalance: currentBalance, 
        error: updateError.message 
      };
    }

    // 记录交易
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      type: 'GENERATION' as TransactionType,
      amount: -amount,
      balance_after: newBalance,
      description,
      reference_id: referenceId,
    });

    return { success: true, newBalance };
  }

  /**
   * 添加积分
   */
  static async addCredits(
    userId: string,
    amount: number,
    type: TransactionType,
    description: string,
    referenceId?: string
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
    const supabase = await createClient();

    // 获取当前余额和总获得
    const { data: currentCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('balance, total_earned')
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentCredits) {
      return { 
        success: false, 
        newBalance: 0, 
        error: 'Failed to fetch credits' 
      };
    }

    const currentBalance = currentCredits.balance;
    const newBalance = currentBalance + amount;
    const newTotalEarned = (currentCredits.total_earned || 0) + amount;

    // 更新余额
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({ 
        balance: newBalance,
        total_earned: newTotalEarned,
      })
      .eq('user_id', userId);

    if (updateError) {
      return { 
        success: false, 
        newBalance: currentBalance, 
        error: updateError.message 
      };
    }

    // 记录交易
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      type,
      amount,
      balance_after: newBalance,
      description,
      reference_id: referenceId,
    });

    return { success: true, newBalance };
  }

  /**
   * 退款积分 (生成失败时)
   */
  static async refundCredits(
    userId: string,
    amount: number,
    generationId: string
  ): Promise<{ success: boolean; newBalance: number }> {
    const result = await this.addCredits(
      userId,
      amount,
      'REFUND',
      `Refund for failed generation`,
      generationId
    );
    return { success: result.success, newBalance: result.newBalance };
  }

  /**
   * 获取交易历史
   */
  static async getTransactionHistory(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<CreditTransaction[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to get transactions: ${error.message}`);
    return data ?? [];
  }

  /**
   * 检查今日社交分享积分
   */
  static async getTodaySocialCredits(userId: string): Promise<number> {
    const supabase = await createClient();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('social_shares')
      .select('credits_awarded')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString());

    if (error) return 0;
    return data?.reduce((sum, share) => sum + share.credits_awarded, 0) ?? 0;
  }
}
