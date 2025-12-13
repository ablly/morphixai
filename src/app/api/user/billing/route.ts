import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * 获取用户账单数据 - 积分和交易记录
 * 生产环境关键 API - 必须确保用户能看到自己的数据
 */
export async function GET(request: NextRequest) {
  try {
    // 直接从 request 读取 cookies，不依赖 next/headers
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // API 路由不需要设置 cookies
          },
        },
      }
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('[API Billing] Auth:', { 
      userId: user?.id, 
      email: user?.email,
      error: authError?.message 
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

    // 使用 Admin 客户端获取数据（绕过 RLS，用户身份已验证）
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 并行获取所有数据
    const [creditsResult, profileResult, transactionsResult] = await Promise.all([
      adminSupabase
        .from('user_credits')
        .select('balance, total_earned, total_spent')
        .eq('user_id', user.id)
        .single(),
      
      adminSupabase
        .from('profiles')
        .select('plan_tier')
        .eq('id', user.id)
        .single(),
      
      adminSupabase
        .from('credit_transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
    ]);

    console.log('[API Billing] Data:', {
      credits: creditsResult.data,
      transactions: transactionsResult.data?.length,
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
    console.error('[API Billing] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
