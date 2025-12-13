import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

/**
 * 调试 API - 检查当前用户的认证状态和数据
 * 仅用于开发调试，生产环境应禁用
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();
    
    // 1. 检查认证状态
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      return NextResponse.json({
        authenticated: false,
        error: authError.message,
        hint: 'User is not authenticated or session expired',
      });
    }
    
    if (!user) {
      return NextResponse.json({
        authenticated: false,
        error: 'No user found',
        hint: 'User needs to login',
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
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
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
        adminData: adminCreditsData, // 绕过 RLS 的数据
      },
      transactions: {
        data: transactionsData,
        error: transactionsError?.message,
        count: transactionsData?.length || 0,
      },
      diagnosis: {
        hasProfile: !!profileData,
        hasCredits: !!creditsData,
        creditsBalance: creditsData?.balance ?? adminCreditsData?.balance ?? 'N/A',
        rlsWorking: !!creditsData,
        dataExists: !!adminCreditsData,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
