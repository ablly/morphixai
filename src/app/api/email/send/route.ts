import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 验证用户身份（某些邮件类型需要）
    const body = await request.json();
    const { type, to, data } = body;

    if (!type || !to) {
      return NextResponse.json(
        { error: 'Missing required fields: type, to' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'welcome':
        result = await EmailService.sendWelcomeEmail(to, data);
        break;
      case 'invite':
        result = await EmailService.sendInviteEmail(to, data);
        break;
      case 'magic-link':
        result = await EmailService.sendMagicLinkEmail(to, data);
        break;
      case 'change-email':
        result = await EmailService.sendChangeEmailEmail(to, data);
        break;
      case 'reset-password':
        result = await EmailService.sendResetPasswordEmail(to, data);
        break;
      case 'purchase-success':
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        result = await EmailService.sendPurchaseSuccessEmail(to, data);
        break;
      case 'referral-reward':
        result = await EmailService.sendReferralRewardEmail(to, data);
        break;
      case 'generation-complete':
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        result = await EmailService.sendGenerationCompleteEmail(to, data);
        break;
      case 'low-credits':
        result = await EmailService.sendLowCreditsEmail(to, data);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    if (result.error) {
      console.error('Email send error:', result.error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: result.data?.id });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
