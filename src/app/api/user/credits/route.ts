import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * 获取当前用户的积分余额
 * 生产环境关键 API - 必须确保用户能看到自己的积分
 */
export async function GET(request: NextRequest) {
  try {
    // 直接从 request 读取 cookies
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
    
    console.log('[API Credits] Auth:', { 
      userId: user?.id, 
      email: user?.email,
      error: authError?.message 
    });
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', balance: 0 },
        { status: 401 }
      );
    }

    // 使用 Admin 客户端获取数据
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
    
    const { data, error } = await adminSupabase
      .from('user_credits')
      .select('balance, total_earned, total_spent')
      .eq('user_id', user.id)
      .single();

    console.log('[API Credits] Data:', { data, error: error?.message });

    if (error) {
      console.error('[API Credits] Fetch error:', error);
      return NextResponse.json({ 
        balance: 0, 
        total_earned: 0, 
        total_spent: 0, 
        userId: user.id 
      });
    }

    return NextResponse.json({
      balance: data?.balance || 0,
      total_earned: data?.total_earned || 0,
      total_spent: data?.total_spent || 0,
      userId: user.id,
    });
  } catch (error: unknown) {
    console.error('[API Credits] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', balance: 0 },
      { status: 500 }
    );
  }
}
