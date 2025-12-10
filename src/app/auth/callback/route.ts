import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ReferralService } from '@/lib/referral/service';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && session?.user) {
      // 检查用户元数据中是否有邀请码
      const referralCode = session.user.user_metadata?.referral_code;
      
      if (referralCode) {
        try {
          // 查找邀请人
          const referrerId = await ReferralService.findReferrerByCode(referralCode);
          
          if (referrerId && referrerId !== session.user.id) {
            // 处理邀请奖励
            await ReferralService.processReferral(referrerId, session.user.id);
          }
        } catch (err) {
          console.error('Failed to process referral:', err);
          // 不阻止用户登录，只记录错误
        }
      }

      // 重定向到目标页面
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 如果出错，重定向到错误页面
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
