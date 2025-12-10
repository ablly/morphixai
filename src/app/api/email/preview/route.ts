import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/components';
import { 
  WelcomeEmail, 
  InviteEmail, 
  MagicLinkEmail, 
  ChangeEmailEmail, 
  ResetPasswordEmail,
  PurchaseSuccessEmail,
  ReferralRewardEmail,
  GenerationCompleteEmail,
  LowCreditsEmail
} from '@/lib/email/templates';

// 仅开发环境可用的邮件预览
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const template = searchParams.get('template') || 'welcome';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const templates: Record<string, React.ReactElement> = {
    welcome: WelcomeEmail({
      username: 'John',
      confirmUrl: `${appUrl}/auth/confirm?token=xxx`,
    }),
    invite: InviteEmail({
      inviterName: 'Jane',
      inviteUrl: `${appUrl}/auth/invite?token=xxx`,
    }),
    'magic-link': MagicLinkEmail({
      loginUrl: `${appUrl}/auth/magic?token=xxx`,
    }),
    'change-email': ChangeEmailEmail({
      newEmail: 'newemail@example.com',
      confirmUrl: `${appUrl}/auth/confirm-email?token=xxx`,
    }),
    'reset-password': ResetPasswordEmail({
      resetUrl: `${appUrl}/auth/reset?token=xxx`,
    }),
    'purchase-success': PurchaseSuccessEmail({
      username: 'John',
      packageName: 'Pro Package',
      credits: 1000,
      amount: '$99.99',
      dashboardUrl: `${appUrl}/dashboard`,
    }),
    'referral-reward': ReferralRewardEmail({
      username: 'John',
      referredUsername: 'Jane',
      creditsEarned: 15,
      totalCredits: 125,
      dashboardUrl: `${appUrl}/dashboard`,
    }),
    'generation-complete': GenerationCompleteEmail({
      username: 'John',
      modelName: 'My Awesome Model',
      viewUrl: `${appUrl}/dashboard/model/123`,
    }),
    'low-credits': LowCreditsEmail({
      username: 'John',
      remainingCredits: 5,
      pricingUrl: `${appUrl}/pricing`,
    }),
  };

  const emailComponent = templates[template];
  
  if (!emailComponent) {
    return NextResponse.json(
      { 
        error: 'Template not found',
        available: Object.keys(templates)
      },
      { status: 404 }
    );
  }

  const html = await render(emailComponent);

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
