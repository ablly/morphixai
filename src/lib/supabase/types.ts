export type TransactionType = 
  | 'PURCHASE'      // 购买积分
  | 'SUBSCRIPTION'  // 订阅获得
  | 'GENERATION'    // 生成消耗
  | 'REFUND'        // 退款
  | 'REFERRAL'      // 邀请奖励
  | 'SOCIAL_SHARE'  // 社交分享奖励
  | 'WELCOME';      // 新用户欢迎积分

export type GenerationStatus = 
  | 'PENDING'       // 等待处理
  | 'PROCESSING'    // 处理中
  | 'COMPLETED'     // 完成
  | 'FAILED';       // 失败

export type GenerationQuality = 
  | 'STANDARD'      // 标准 512px - 10积分
  | 'HIGH'          // 高清 1024px - 15积分
  | 'ULTRA';        // 超清 1536px - 25积分

export type SocialPlatform = 
  | 'TWITTER'       // 5积分
  | 'TIKTOK'        // 5积分
  | 'REDDIT'        // 5积分
  | 'LINKEDIN'      // 5积分
  | 'FACEBOOK';     // 3积分

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  referral_code: string;
  referred_by: string | null;
  first_purchase_used: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCredits {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  description: string;
  reference_id: string | null;
  created_at: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_usd: number;
  stripe_price_id: string;
  is_subscription: boolean;
  billing_period: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Generation {
  id: string;
  user_id: string;
  source_image_url: string;
  quality: GenerationQuality;
  credits_used: number;
  status: GenerationStatus;
  model_url: string | null;
  thumbnail_url: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  credits_awarded: number;
  created_at: string;
}

export interface SocialShare {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  generation_id: string | null;
  credits_awarded: number;
  share_url: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  package_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

// 导出数据库类型
export type { Database, Tables, Enums } from './database.types';
