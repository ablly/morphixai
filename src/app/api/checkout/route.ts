import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StripeService, CREDIT_PACKAGES, FIRST_PURCHASE_DISCOUNT } from '@/lib/stripe/service';
import { AdminService } from '@/lib/admin/service';

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

    const pkg = CREDIT_PACKAGES[packageId as keyof typeof CREDIT_PACKAGES];

    // 获取应用 URL - 生产环境使用正式域名（带 www，与 Vercel 重定向配置一致）
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

    // 记录支付意向（用户点击了购买按钮）
    const isFirst = await StripeService.isFirstPurchase(user.id);
    const amountCents = isFirst 
      ? Math.round(pkg.priceUsd * FIRST_PURCHASE_DISCOUNT * 100)
      : Math.round(pkg.priceUsd * 100);
    
    await AdminService.recordPaymentIntent(
      user.id,
      packageId,
      amountCents,
      result.sessionId
    );

    console.log(`[Checkout] Payment intent recorded: user=${user.email}, package=${packageId}, amount=${amountCents}`);

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
