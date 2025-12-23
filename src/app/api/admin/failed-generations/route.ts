import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { AdminService } from '@/lib/admin/service';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await AdminService.isAdmin(user.id, user.email || undefined);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminClient = await createAdminClient();

    // 获取失败的生成记录，关联用户信息
    const { data: generations, error } = await adminClient
      .from('generations')
      .select(`
        id,
        user_id,
        error_message,
        credits_used,
        created_at,
        completed_at,
        source_image_url,
        metadata
      `)
      .eq('status', 'FAILED')
      .order('completed_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Failed to fetch generations:', error);
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }

    // 获取用户信息
    const userIds = [...new Set(generations?.map(g => g.user_id) || [])];
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('id, email, display_name')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // 合并数据
    const enrichedGenerations = generations?.map(gen => {
      const profile = profileMap.get(gen.user_id);
      return {
        ...gen,
        user_email: profile?.email || 'unknown',
        user_name: profile?.display_name || profile?.email?.split('@')[0] || 'unknown',
        notified: gen.metadata?.user_notified || false,
      };
    }) || [];

    return NextResponse.json({ generations: enrichedGenerations });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
