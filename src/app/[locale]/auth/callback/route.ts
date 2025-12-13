import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { ReferralService } from '@/lib/referral/service';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const refCode = searchParams.get('ref');
  const type = searchParams.get('type');
  
  const pathname = new URL(request.url).pathname;
  const locale = pathname.split('/')[1] || 'en';
  const next = searchParams.get('next') ?? `/${locale}/dashboard`;

  // 用于收集需要设置的 cookies
  const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

  if (code) {
    // 创建 Supabase 客户端
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookies) {
            cookies.forEach((cookie) => {
              cookiesToSet.push(cookie);
            });
          },
        },
      }
    );
    
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && session?.user) {
      console.log('[Auth Callback] Session established:', session.user.id, session.user.email);
      
      // 确定重定向 URL
      let redirectUrl = `${origin}${next}`;
      
      if (type === 'recovery') {
        redirectUrl = `${origin}/${locale}/reset-password`;
      }
      
      // 处理邀请码
      const referralCode = refCode || session.user.user_metadata?.referral_code;
      if (referralCode && type !== 'recovery') {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('referred_by')
            .eq('id', session.user.id)
            .single();
          
          if (!profile?.referred_by) {
            const referrerId = await ReferralService.findReferrerByCode(referralCode);
            if (referrerId && referrerId !== session.user.id) {
              await ReferralService.processReferral(referrerId, session.user.id);
              redirectUrl = `${origin}${next}?referral_applied=true`;
            }
          }
        } catch (err) {
          console.error('[Auth Callback] Referral error:', err);
        }
      }
      
      // 创建 response 并设置所有 cookies
      const response = NextResponse.redirect(redirectUrl);
      
      // 关键：设置所有收集到的 cookies
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, {
          ...options,
          // 确保 cookie 在整个域名下可用
          path: '/',
          // 生产环境使用 secure
          secure: process.env.NODE_ENV === 'production',
          // 允许跨站点请求
          sameSite: 'lax',
        });
      });
      
      console.log('[Auth Callback] Cookies set:', cookiesToSet.map(c => c.name));
      return response;
    }
    
    console.error('[Auth Callback] Auth error:', error?.message);
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=auth_failed`);
}
