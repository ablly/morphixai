import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ReferralService } from '@/lib/referral/service';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const refCode = searchParams.get('ref'); // 从 URL 获取邀请码
  const type = searchParams.get('type'); // 获取类型 (recovery, signup, etc.)
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    // 如果是密码重置流程，重定向到重置密码页面
    if (type === 'recovery' && !error && session) {
      console.log('[Auth Callback] Recovery flow detected, redirecting to reset-password');
      return NextResponse.redirect(`${origin}/en/reset-password`);
    }
    
    if (!error && session?.user) {
      // 获取邀请码：优先从 URL 参数，其次从用户元数据
      const referralCode = refCode || session.user.user_metadata?.referral_code;
      
      console.log('[Auth Callback] Processing referral:', { 
        userId: session.user.id, 
        referralCode 
      });
      
      if (referralCode) {
        try {
          // 检查是否已经处理过邀请
          const { data: profile } = await supabase
            .from('profiles')
            .select('referred_by')
            .eq('id', session.user.id)
            .single();
          
          if (!profile?.referred_by) {
            // 查找邀请人
            const referrerId = await ReferralService.findReferrerByCode(referralCode);
            
            if (referrerId && referrerId !== session.user.id) {
              // 处理邀请奖励
              const result = await ReferralService.processReferral(referrerId, session.user.id);
              console.log('[Auth Callback] Referral processed:', result);
            }
          }
        } catch (err) {
          console.error('[Auth Callback] Failed to process referral:', err);
        }
      }

      // 重定向到目标页面
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 如果出错，重定向到错误页面
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
