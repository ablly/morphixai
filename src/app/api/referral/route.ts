import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ReferralService } from '@/lib/referral/service';

// 获取用户邀请信息
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取邀请码
    const code = await ReferralService.getReferralCode(user.id);
    
    // 获取邀请统计
    const stats = await ReferralService.getReferralStats(user.id);
    
    // 获取邀请历史
    const history = await ReferralService.getReferralHistory(user.id);

    return NextResponse.json({
      code,
      stats,
      history,
    });
  } catch (error: any) {
    console.error('Get referral info error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 处理邀请奖励（新用户注册后调用）
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { referralCode } = body;

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code required' }, { status: 400 });
    }

    // 查找邀请人
    const referrerId = await ReferralService.findReferrerByCode(referralCode);
    if (!referrerId) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
    }

    // 不能自己邀请自己
    if (referrerId === user.id) {
      return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 });
    }

    // 处理邀请奖励
    const result = await ReferralService.processReferral(referrerId, user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Referral processed successfully' });
  } catch (error: any) {
    console.error('Process referral error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
