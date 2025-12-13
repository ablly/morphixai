import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * 调试 API - 检查当前用户的认证状态和数据
 * 仅用于开发调试，生产环境应禁用
 */
export async function GET(request: NextRequest) {
  try {
    // 检查 cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const supabaseCookies = allCookies.filter(c => c.name.includes('supabase') || c.name.includes('sb-'));
    
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();
    
    // 1. 检查认证状态
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // 也检查 session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (authError && !user) {
      return NextResponse.json({
        authenticated: false,
        error: authError.message,
        sessionError: sessionError?.message,
        hint: 'User is not authenticated or session expired',
        cookies: {
          total: allCookies.length,
          supabaseRelated: supabaseCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
        },
      });
    }
    
    if (!user) {
      return NextResponse.json({
        authenticated: false,
        error: 'No user found',
        hint: 'User needs to login',
        cookies: {
          total: allCookies.length,
          supabaseRelated: supabaseCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
        },
      });
    }
    
    // 2. 检查用户数据 (使用普通客户端，测试 RLS)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    const { data: creditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    // 3. 使用 Admin 客户端检查数据是否存在 (绕过 RLS)
    const { data: adminCreditsData } = await adminSupabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    const { data: adminTransactionsData } = await adminSupabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
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
        supabaseRelated: supabaseCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      },
      profile: {
        data: profileData,
        error: profileError?.message,
        rlsBlocked: !profileData && !!profileError,
      },
      credits: {
        data: creditsData,
        error: creditsError?.message,
        rlsBlocked: !creditsData && !!creditsError,
        adminData: adminCreditsData,
      },
      transactions: {
        data: transactionsData,
        error: transactionsError?.message,
        count: transactionsData?.length || 0,
        adminData: adminTransactionsData,
        adminCount: adminTransactionsData?.length || 0,
      },
      diagnosis: {
        hasProfile: !!profileData,
        hasCredits: !!creditsData,
        creditsBalance: creditsData?.balance ?? adminCreditsData?.balance ?? 'N/A',
        rlsWorking: !!creditsData,
        dataExists: !!adminCreditsData,
        transactionsExist: (adminTransactionsData?.length || 0) > 0,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
