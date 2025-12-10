import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email';
import { createClient } from '@supabase/supabase-js';

// 使用 service role key 来验证 webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Supabase Auth Webhook 处理
// 需要在 Supabase Dashboard 配置 Webhook URL
export async function POST(request: NextRequest) {
  try {
    // 验证 webhook 签名（生产环境建议添加）
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
    
    const body = await request.json();
    const { type, record, old_record } = body;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    switch (type) {
      case 'INSERT':
        // 新用户注册
        if (record?.email && record?.confirmation_token) {
          const confirmUrl = `${appUrl}/auth/confirm?token=${record.confirmation_token}`;
          
          await EmailService.sendWelcomeEmail(record.email, {
            username: record.raw_user_meta_data?.username,
            confirmUrl,
          });
        }
        break;

      case 'UPDATE':
        // 用户更新（如邮箱变更）
        if (old_record?.email !== record?.email && record?.email_change_token_new) {
          const confirmUrl = `${appUrl}/auth/confirm-email?token=${record.email_change_token_new}`;
          
          await EmailService.sendChangeEmailEmail(record.email, {
            newEmail: record.email,
            confirmUrl,
          });
        }
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
