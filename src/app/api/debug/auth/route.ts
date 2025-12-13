import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * 调试 API - 检查当前用户的认证状态和数据
 * 用于诊断生产环境问题
 */
export async function GET(request: NextRequest) {
  try {
    // 获取所有 cookies
    const allCookies = request.cookies.getAll();
    const supabaseCookies = allCookies.filter(c => 
      c.name.includes('supabase') || c.name.includes('sb-')
    );
    
    // 创建 Supabase 客户端
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      }
    );
    
    // 检查认证状态
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (!user) {
      return NextResponse.json({
        authenticated: false,
        error: authError?.message || 'No user',
        sessionError: sessionError?.message,
        cookies: {
          total: allCookies.length,
          supabaseRelated: supabaseCookies.map(c => ({ 
            name: c.name, 
            hasValue: !!c.value,
            valueLength: c.value?.length || 0
          })),
        },
        hint: 'User needs to login or session expired',
      });
    }
    
    // 使用 Admin 客户端获取数据
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );
    
    // 获取用户数据
    const [profileResult, creditsResult, transactionsResult] = await Promise.all([
      adminSupabase.from('profiles').select('*').eq('id', user.id).single(),
      adminSupabase.from('user_credits').select('*').eq('user_id', user.id).single(),
      adminSupabase.from('credit_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    ]);
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      session: {
        hasSession: !!session,
        expiresAt: session?.expires_at,
      },
      cookies: {
        total: allCookies.length,
        supabaseRelated: supabaseCookies.map(c => ({ 
          name: c.name, 
          hasValue: !!c.value 
        })),
      },
      profile: profileResult.data,
      credits: creditsResult.data,
      transactions: {
        count: transactionsResult.data?.length || 0,
        data: transactionsResult.data,
      },
      diagnosis: {
        hasProfile: !!profileResult.data,
        hasCredits: !!creditsResult.data,
        creditsBalance: creditsResult.data?.balance ?? 'N/A',
        transactionsExist: (transactionsResult.data?.length || 0) > 0,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
