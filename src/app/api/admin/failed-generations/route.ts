import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { AdminService } from '@/lib/admin/service';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await AdminService.isAdmin(user.id, user.email || undefined);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminClient = await createAdminClient();

    // 先获取失败的生成记录
    const { data: generations, error } = await adminClient
      .from('generations')
      .select('*')
      .eq('status', 'FAILED')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Failed to fetch generations:', error);
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }

    // 单独获取用户信息
    const userIds = [...new Set(generations?.map((g) => g.user_id) || [])];
    
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // 合并数据
    const enrichedGenerations = generations?.map((gen) => {
      const profile = profileMap.get(gen.user_id);
      const email = profile?.email || '';
      const userName = profile?.full_name || (email ? email.split('@')[0] : 'User');
      
      return {
        id: gen.id,
        user_id: gen.user_id,
        error_message: gen.error_message || '生成过程中发生未知错误',
        credits_used: gen.credits_used,
        created_at: gen.created_at,
        completed_at: gen.completed_at,
        source_image_url: gen.source_image_url,
        metadata: gen.metadata,
        user_email: email || `user-${gen.user_id.slice(0, 8)}@unknown`,
        user_name: userName,
        notified: gen.metadata?.user_notified || false,
      };
    }) || [];

    return NextResponse.json({ generations: enrichedGenerations });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
