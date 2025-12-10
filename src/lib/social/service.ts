import { createClient } from '@/lib/supabase/server';
import { CreditsService } from '@/lib/credits/service';

// 社交平台奖励配置
export const SOCIAL_REWARDS = {
  TWITTER: 5,
  TIKTOK: 5,
  REDDIT: 5,
  LINKEDIN: 5,
  FACEBOOK: 3,
} as const;

export type SocialPlatform = keyof typeof SOCIAL_REWARDS;

export const DAILY_SOCIAL_LIMIT = 20; // 每日最多获得20积分

export interface ShareResult {
  success: boolean;
  creditsAwarded: number;
  error?: string;
  dailyRemaining: number;
}

export interface ShareStats {
  todayCredits: number;
  totalShares: number;
  platformBreakdown: Record<SocialPlatform, number>;
}

export class SocialShareService {
  /**
   * 获取今日已获得的社交分享积分
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

  /**
   * 检查是否已分享过同一内容到同一平台
   */
  static async hasSharedBefore(
    userId: string,
    platform: SocialPlatform,
    generationId?: string
  ): Promise<boolean> {
    const supabase = await createClient();

    let query = supabase
      .from('social_shares')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', platform);

    if (generationId) {
      query = query.eq('generation_id', generationId);
    }

    const { data } = await query.limit(1);
    return (data?.length ?? 0) > 0;
  }

  /**
   * 记录社交分享并发放奖励
   */
  static async recordShare(
    userId: string,
    platform: SocialPlatform,
    generationId?: string,
    shareUrl?: string
  ): Promise<ShareResult> {
    const supabase = await createClient();

    // 检查今日限额
    const todayCredits = await this.getTodaySocialCredits(userId);
    if (todayCredits >= DAILY_SOCIAL_LIMIT) {
      return {
        success: false,
        creditsAwarded: 0,
        error: 'Daily social share limit reached',
        dailyRemaining: 0,
      };
    }

    // 检查重复分享 (同一内容到同一平台)
    if (generationId) {
      const hasShared = await this.hasSharedBefore(userId, platform, generationId);
      if (hasShared) {
        return {
          success: false,
          creditsAwarded: 0,
          error: 'Already shared this content to this platform',
          dailyRemaining: DAILY_SOCIAL_LIMIT - todayCredits,
        };
      }
    }

    // 计算奖励 (不超过每日限额)
    const baseReward = SOCIAL_REWARDS[platform];
    const remainingToday = DAILY_SOCIAL_LIMIT - todayCredits;
    const creditsToAward = Math.min(baseReward, remainingToday);

    if (creditsToAward <= 0) {
      return {
        success: false,
        creditsAwarded: 0,
        error: 'Daily limit reached',
        dailyRemaining: 0,
      };
    }

    // 记录分享
    const { error: insertError } = await supabase.from('social_shares').insert({
      user_id: userId,
      platform,
      generation_id: generationId || null,
      credits_awarded: creditsToAward,
      share_url: shareUrl || null,
    });

    if (insertError) {
      return {
        success: false,
        creditsAwarded: 0,
        error: insertError.message,
        dailyRemaining: remainingToday,
      };
    }

    // 添加积分
    await CreditsService.addCredits(
      userId,
      creditsToAward,
      'SOCIAL_SHARE',
      `Social share reward (${platform})`,
      generationId
    );

    return {
      success: true,
      creditsAwarded: creditsToAward,
      dailyRemaining: remainingToday - creditsToAward,
    };
  }

  /**
   * 获取分享统计
   */
  static async getShareStats(userId: string): Promise<ShareStats> {
    const supabase = await createClient();

    // 今日积分
    const todayCredits = await this.getTodaySocialCredits(userId);

    // 总分享数和平台分布
    const { data } = await supabase
      .from('social_shares')
      .select('platform, credits_awarded')
      .eq('user_id', userId);

    const platformBreakdown: Record<SocialPlatform, number> = {
      TWITTER: 0,
      TIKTOK: 0,
      REDDIT: 0,
      LINKEDIN: 0,
      FACEBOOK: 0,
    };

    if (data) {
      data.forEach((share) => {
        const platform = share.platform as SocialPlatform;
        if (platform in platformBreakdown) {
          platformBreakdown[platform]++;
        }
      });
    }

    return {
      todayCredits,
      totalShares: data?.length ?? 0,
      platformBreakdown,
    };
  }

  /**
   * 生成分享链接
   */
  static generateShareUrl(
    platform: SocialPlatform,
    modelUrl: string,
    title: string
  ): string {
    const encodedUrl = encodeURIComponent(modelUrl);
    const encodedTitle = encodeURIComponent(title);

    switch (platform) {
      case 'TWITTER':
        return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
      case 'FACEBOOK':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      case 'LINKEDIN':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      case 'REDDIT':
        return `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
      case 'TIKTOK':
        // TikTok 没有直接分享链接，返回复制提示
        return modelUrl;
      default:
        return modelUrl;
    }
  }
}
