import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { AdminService } from '@/lib/admin/service';
import { EmailService } from '@/lib/email/service';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { generationId, userId, userEmail, userName, reason, creditsRefunded } = body;

    if (!generationId || !userEmail || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 发送邮件给用户
    await EmailService.sendGenerationFailedToUserEmail(userEmail, {
      username: userName,
      reason,
      creditsRefunded: creditsRefunded || 0,
    });

    // 更新生成记录，标记已通知
    const adminClient = await createAdminClient();
    
    // 先获取当前 metadata
    const { data: generation } = await adminClient
      .from('generations')
      .select('metadata')
      .eq('id', generationId)
      .single();

    // 更新 metadata
    await adminClient
      .from('generations')
      .update({
        metadata: {
          ...(generation?.metadata || {}),
          user_notified: true,
          notified_at: new Date().toISOString(),
          notified_by: user.email,
          notification_reason: reason,
        },
      })
      .eq('id', generationId);

    console.log(`[Admin] Sent failure notification to ${userEmail} for generation ${generationId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notify error:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
