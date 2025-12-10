import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { confirmEmail } = body;

    // 验证确认邮箱
    if (confirmEmail !== user.email) {
      return NextResponse.json({ error: 'Email confirmation does not match' }, { status: 400 });
    }

    // 删除用户相关数据（按依赖顺序）
    // 1. 删除社交分享记录
    await supabase.from('social_shares').delete().eq('user_id', user.id);
    
    // 2. 删除邀请记录
    await supabase.from('referrals').delete().eq('referrer_id', user.id);
    await supabase.from('referrals').delete().eq('referred_id', user.id);
    
    // 3. 删除积分交易记录
    await supabase.from('credit_transactions').delete().eq('user_id', user.id);
    
    // 4. 删除生成记录
    await supabase.from('generations').delete().eq('user_id', user.id);
    
    // 5. 删除订阅记录
    await supabase.from('subscriptions').delete().eq('user_id', user.id);
    
    // 6. 删除积分余额
    await supabase.from('user_credits').delete().eq('user_id', user.id);
    
    // 7. 删除用户资料
    await supabase.from('profiles').delete().eq('id', user.id);

    // 8. 删除 Auth 用户（需要 service_role key，这里用 signOut 代替）
    // 注意：完全删除 auth.users 需要使用 Supabase Admin API
    await supabase.auth.signOut();

    return NextResponse.json({ 
      success: true, 
      message: 'Account data deleted. Please contact support to complete account removal.' 
    });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
