import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

/**
 * 获取用户账单数据 - 积分和交易记录
 * 使用服务端认证，确保数据正确获取
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('[API Billing] Auth check:', { 
      userId: user?.id, 
      error: authError?.message,
      hasUser: !!user 
    });
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authError?.message || 'Not logged in' },
        { status: 401 }
      );
    }

    // 获取分页参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 使用 Admin 客户端获取数据（绕过 RLS，确保数据可访问）
    const adminSupabase = await createAdminClient();

    // 并行获取所有数据
    const [creditsResult, profileResult, transactionsResult] = await Promise.all([
      // 获取用户积分
      adminSupabase
        .from('user_credits')
        .select('balance, total_earned, total_spent')
        .eq('user_id', user.id)
        .single(),
      
      // 获取用户套餐
      adminSupabase
        .from('profiles')
        .select('plan_tier')
        .eq('id', user.id)
        .single(),
      
      // 获取交易记录（带分页）
      adminSupabase
        .from('credit_transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
    ]);

    console.log('[API Billing] Data fetch:', {
      credits: creditsResult.data,
      creditsError: creditsResult.error?.message,
      profile: profileResult.data,
      transactionsCount: transactionsResult.data?.length,
    });

    const totalPages = transactionsResult.count 
      ? Math.ceil(transactionsResult.count / limit) 
      : 1;

    return NextResponse.json({
      success: true,
      data: {
        credits: creditsResult.data || { balance: 0, total_earned: 0, total_spent: 0 },
        planTier: profileResult.data?.plan_tier || 'free',
        transactions: transactionsResult.data || [],
        pagination: {
          page,
          limit,
          totalPages,
          totalCount: transactionsResult.count || 0,
        },
      },
    });
  } catch (error: unknown) {
    console.error('[API] Billing data error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
