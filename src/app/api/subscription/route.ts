import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StripeService, SUBSCRIPTION_PACKAGES } from '@/lib/stripe/service';

// 获取用户订阅状态
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await StripeService.getUserSubscription(user.id);
    return NextResponse.json({ subscription });
  } catch (error: any) {
    console.error('Get subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 创建订阅
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { packageId, stripePriceId } = body;

    if (!packageId || !(packageId in SUBSCRIPTION_PACKAGES)) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    if (!stripePriceId) {
      return NextResponse.json({ error: 'Stripe price ID required' }, { status: 400 });
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const result = await StripeService.createSubscriptionSession(
      user.id,
      user.email!,
      packageId as keyof typeof SUBSCRIPTION_PACKAGES,
      stripePriceId,
      `${origin}/dashboard?subscription=success`,
      `${origin}/pricing?subscription=canceled`
    );

    if (!result) {
      return NextResponse.json({ error: 'Failed to create subscription session' }, { status: 500 });
    }

    return NextResponse.json({ sessionId: result.sessionId, url: result.url });
  } catch (error: any) {
    console.error('Create subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 取消订阅
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 });
    }

    const result = await StripeService.cancelSubscription(subscriptionId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Subscription will be canceled at period end' });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
