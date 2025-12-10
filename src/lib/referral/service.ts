import { createClient } from '@/lib/supabase/server';
import { CreditsService } from '@/lib/credits/service';
import { EmailService } from '@/lib/email/service';

export const REFERRAL_REWARD = 5; // 邀请双方各得5积分
export const MAX_REFERRALS_PER_USER = 10; // 每用户最多邀请10人 (上限50积分)

export interface ReferralStats {
  totalReferrals: number;
  totalCreditsEarned: number;
  pendingReferrals: number;
}

export interface ReferralRecord {
  id: string;
  referredId: string;
  referredEmail: string;
  creditsAwarded: number;
  createdAt: string;
}

export class ReferralService {
  /**
   * 获取用户的邀请码
   */
  static async getReferralCode(userId: string): Promise<string | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data?.referral_code ?? null;
  }

  /**
   * 通过邀请码查找邀请人
   */
  static async findReferrerByCode(code: string): Promise<string | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', code.toUpperCase())
      .single();

    if (error) return null;
    return data?.id ?? null;
  }

  /**
   * 处理邀请奖励 (新用户注册时调用)
   */
  static async processReferral(
    referrerId: string,
    referredId: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // 检查是否已经处理过
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrerId)
      .eq('referred_id', referredId)
      .single();

    if (existing) {
      return { success: false, error: 'Referral already processed' };
    }

    // 检查邀请人是否达到上限
    const stats = await this.getReferralStats(referrerId);
    if (stats.totalReferrals >= MAX_REFERRALS_PER_USER) {
      return { success: false, error: 'Referral limit reached' };
    }

    // 给邀请人添加积分
    await CreditsService.addCredits(
      referrerId,
      REFERRAL_REWARD,
      'REFERRAL',
      `Referral reward for inviting new user`,
      referredId
    );

    // 给被邀请人添加积分
    await CreditsService.addCredits(
      referredId,
      REFERRAL_REWARD,
      'REFERRAL',
      `Referral bonus for joining via invitation`,
      referrerId
    );

    // 记录邀请关系
    const { error } = await supabase.from('referrals').insert({
      referrer_id: referrerId,
      referred_id: referredId,
      credits_awarded: REFERRAL_REWARD,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // 更新被邀请人的 referred_by 字段
    await supabase
      .from('profiles')
      .update({ referred_by: referrerId })
      .eq('id', referredId);

    // 发送邮件通知给邀请人
    try {
      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('email, display_name')
        .eq('id', referrerId)
        .single();

      const { data: referredProfile } = await supabase
        .from('profiles')
        .select('email, display_name')
        .eq('id', referredId)
        .single();

      const { data: referrerCredits } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', referrerId)
        .single();

      if (referrerProfile?.email) {
        await EmailService.sendReferralRewardEmail(referrerProfile.email, {
          username: referrerProfile.display_name || undefined,
          referredUsername: referredProfile?.display_name || referredProfile?.email?.split('@')[0] || 'A new user',
          creditsEarned: REFERRAL_REWARD,
          totalCredits: referrerCredits?.balance || REFERRAL_REWARD,
          dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
        });
      }
    } catch (emailError) {
      console.error('Failed to send referral reward email:', emailError);
      // 不影响主流程
    }

    return { success: true };
  }

  /**
   * 获取邀请统计
   */
  static async getReferralStats(userId: string): Promise<ReferralStats> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('referrals')
      .select('credits_awarded')
      .eq('referrer_id', userId);

    if (error || !data) {
      return { totalReferrals: 0, totalCreditsEarned: 0, pendingReferrals: 0 };
    }

    return {
      totalReferrals: data.length,
      totalCreditsEarned: data.reduce((sum, r) => sum + r.credits_awarded, 0),
      pendingReferrals: 0, // 可以扩展为追踪未完成注册的邀请
    };
  }

  /**
   * 获取邀请历史
   */
  static async getReferralHistory(
    userId: string,
    limit = 20
  ): Promise<ReferralRecord[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('referrals')
      .select(`
        id,
        referred_id,
        credits_awarded,
        created_at,
        profiles!referrals_referred_id_fkey (email)
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((r: any) => ({
      id: r.id,
      referredId: r.referred_id,
      referredEmail: r.profiles?.email ?? 'Unknown',
      creditsAwarded: r.credits_awarded,
      createdAt: r.created_at,
    }));
  }

  /**
   * 生成邀请链接
   */
  static generateReferralLink(code: string, baseUrl: string): string {
    return `${baseUrl}/ref/${code}`;
  }
}
