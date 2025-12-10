export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      credit_packages: {
        Row: {
          billing_period: string | null
          created_at: string | null
          credits: number
          id: string
          is_active: boolean | null
          is_subscription: boolean | null
          name: string
          price_usd: number
          sort_order: number | null
          stripe_price_id: string | null
        }
        Insert: {
          billing_period?: string | null
          created_at?: string | null
          credits: number
          id?: string
          is_active?: boolean | null
          is_subscription?: boolean | null
          name: string
          price_usd: number
          sort_order?: number | null
          stripe_price_id?: string | null
        }
        Update: {
          billing_period?: string | null
          created_at?: string | null
          credits?: number
          id?: string
          is_active?: boolean | null
          is_subscription?: boolean | null
          name?: string
          price_usd?: number
          sort_order?: number | null
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          description: string
          id: string
          reference_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          description: string
          id?: string
          reference_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          description?: string
          id?: string
          reference_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      generations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          credits_used: number
          error_message: string | null
          id: string
          model_url: string | null
          quality: Database["public"]["Enums"]["generation_quality"]
          source_image_url: string
          status: Database["public"]["Enums"]["generation_status"]
          thumbnail_url: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          credits_used: number
          error_message?: string | null
          id?: string
          model_url?: string | null
          quality?: Database["public"]["Enums"]["generation_quality"]
          source_image_url: string
          status?: Database["public"]["Enums"]["generation_status"]
          thumbnail_url?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          credits_used?: number
          error_message?: string | null
          id?: string
          model_url?: string | null
          quality?: Database["public"]["Enums"]["generation_quality"]
          source_image_url?: string
          status?: Database["public"]["Enums"]["generation_status"]
          thumbnail_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_purchase_used: boolean | null
          full_name: string | null
          id: string
          referral_code: string
          referred_by: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_purchase_used?: boolean | null
          full_name?: string | null
          id: string
          referral_code: string
          referred_by?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_purchase_used?: boolean | null
          full_name?: string | null
          id?: string
          referral_code?: string
          referred_by?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          credits_awarded: number
          id: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string | null
          credits_awarded?: number
          id?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string | null
          credits_awarded?: number
          id?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      social_shares: {
        Row: {
          created_at: string | null
          credits_awarded: number
          generation_id: string | null
          id: string
          platform: Database["public"]["Enums"]["social_platform"]
          share_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_awarded: number
          generation_id?: string | null
          id?: string
          platform: Database["public"]["Enums"]["social_platform"]
          share_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_awarded?: number
          generation_id?: string | null
          id?: string
          platform?: Database["public"]["Enums"]["social_platform"]
          share_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          package_id: string | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          package_id?: string | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          package_id?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          balance: number
          created_at: string | null
          id: string
          total_earned: number
          total_spent: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: Record<string, never>; Returns: string }
    }
    Enums: {
      generation_quality: "STANDARD" | "HIGH" | "ULTRA"
      generation_status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
      social_platform: "TWITTER" | "TIKTOK" | "REDDIT" | "LINKEDIN" | "FACEBOOK"
      transaction_type:
        | "PURCHASE"
        | "SUBSCRIPTION"
        | "GENERATION"
        | "REFUND"
        | "REFERRAL"
        | "SOCIAL_SHARE"
        | "WELCOME"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// 便捷类型导出
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
