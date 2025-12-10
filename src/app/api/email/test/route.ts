import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email';

// 测试邮件发送 - 仅开发环境
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { to, template = 'welcome' } = body;

    if (!to) {
      return NextResponse.json({ error: 'Missing "to" email address' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    let result;

    switch (template) {
      case 'welcome':
        result = await EmailService.sendWelcomeEmail(to, {
          username: 'Test User',
          confirmUrl: `${appUrl}/auth/confirm?token=test123`,
        });
        break;
      case 'purchase':
        result = await EmailService.sendPurchaseSuccessEmail(to, {
          username: 'Test User',
          packageName: 'Pro Package',
          credits: 1000,
          amount: '$99.99',
          dashboardUrl: `${appUrl}/dashboard`,
        });
        break;
      case 'referral':
        result = await EmailService.sendReferralRewardEmail(to, {
          username: 'Test User',
          referredUsername: 'Friend',
          creditsEarned: 15,
          totalCredits: 125,
          dashboardUrl: `${appUrl}/dashboard`,
        });
        break;
      case 'generation':
        result = await EmailService.sendGenerationCompleteEmail(to, {
          username: 'Test User',
          modelName: 'My 3D Model',
          viewUrl: `${appUrl}/dashboard/model/123`,
        });
        break;
      case 'low-credits':
        result = await EmailService.sendLowCreditsEmail(to, {
          username: 'Test User',
          remainingCredits: 5,
          pricingUrl: `${appUrl}/pricing`,
        });
        break;
      case 'reset':
        result = await EmailService.sendResetPasswordEmail(to, {
          resetUrl: `${appUrl}/auth/reset?token=test123`,
        });
        break;
      default:
        return NextResponse.json({ error: 'Unknown template' }, { status: 400 });
    }

    if (result.error) {
      console.error('Email error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      id: result.data?.id,
      message: `Email sent to ${to}` 
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
