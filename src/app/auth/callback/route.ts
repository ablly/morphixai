import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { ReferralService } from '@/lib/referral/service';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const refCode = searchParams.get('ref');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/';

  // 用于收集需要设置的 cookies
  const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

  if (code) {
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
      console.log('[Auth Callback Root] Session established:', session.user.id);
      
      let redirectUrl = `${origin}${next}`;
      
      if (type === 'recovery') {
        redirectUrl = `${origin}/en/reset-password`;
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
            }
          }
        } catch (err) {
          console.error('[Auth Callback Root] Referral error:', err);
        }
      }
      
      const response = NextResponse.redirect(redirectUrl);
      
      // 设置所有 cookies
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, {
          ...options,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      });
      
      return response;
    }
    
    console.error('[Auth Callback Root] Auth error:', error?.message);
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
