import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SocialShareService, SocialPlatform, SOCIAL_REWARDS } from '@/lib/social/service';
import { checkRateLimit } from '@/lib/rate-limit';

// 记录社交分享并获取奖励
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = checkRateLimit(user.id, 'api:share');
    if (!rateLimit.allowed) {
      return NextResponse.json({ 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(rateLimit.resetIn / 1000),
      }, { status: 429 });
    }

    const body = await request.json();
    const { platform, generationId, shareUrl } = body;

    // 验证平台
    if (!platform || !(platform in SOCIAL_REWARDS)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    const result = await SocialShareService.recordShare(
      user.id,
      platform as SocialPlatform,
      generationId,
      shareUrl
    );

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error,
        dailyRemaining: result.dailyRemaining 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      creditsAwarded: result.creditsAwarded,
      dailyRemaining: result.dailyRemaining,
    });
  } catch (error: any) {
    console.error('Social share error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 获取分享统计
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await SocialShareService.getShareStats(user.id);
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Get share stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
