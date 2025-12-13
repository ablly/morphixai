import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

/**
 * 获取当前用户的积分余额
 * 使用服务端认证，确保数据正确获取
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('[API Credits] Auth check:', { 
      userId: user?.id, 
      error: authError?.message 
    });
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', balance: 0 },
        { status: 401 }
      );
    }

    // 使用 Admin 客户端获取数据（绕过 RLS）
    const adminSupabase = await createAdminClient();
    
    const { data, error } = await adminSupabase
      .from('user_credits')
      .select('balance, total_earned, total_spent')
      .eq('user_id', user.id)
      .single();

    console.log('[API Credits] Data fetch:', { 
      data, 
      error: error?.message 
    });

    if (error) {
      console.error('[API] Credits fetch error:', error);
      return NextResponse.json({ balance: 0, total_earned: 0, total_spent: 0, userId: user.id });
    }

    return NextResponse.json({
      balance: data?.balance || 0,
      total_earned: data?.total_earned || 0,
      total_spent: data?.total_spent || 0,
      userId: user.id,
    });
  } catch (error: unknown) {
    console.error('[API] Credits error:', error);
    return NextResponse.json(
      { error: 'Internal server error', balance: 0 },
      { status: 500 }
    );
  }
}
