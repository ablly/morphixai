import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StripeService, CREDIT_PACKAGES } from '@/lib/stripe/service';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const { packageId } = await request.json();

    // 验证套餐 ID
    if (!packageId || !CREDIT_PACKAGES[packageId as keyof typeof CREDIT_PACKAGES]) {
      return NextResponse.json(
        { error: '无效的套餐' },
        { status: 400 }
      );
    }

    // 获取应用 URL - 生产环境使用正式域名
    const appUrl = process.env.NODE_ENV === 'production' 
      ? 'https://www.morphix-ai.com'
      : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    
    // 创建 Checkout Session
    const result = await StripeService.createCheckoutSession(
      user.id,
      user.email!,
      packageId as keyof typeof CREDIT_PACKAGES,
      `${appUrl}/zh/dashboard?payment=success`,
      `${appUrl}/zh/pricing?payment=cancelled`
    );

    if (!result) {
      return NextResponse.json(
        { error: '创建支付会话失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionId: result.sessionId,
      url: result.url,
    });
  } catch (error) {
    console.error('[Checkout] Error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
