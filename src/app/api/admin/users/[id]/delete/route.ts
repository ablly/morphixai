import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/admin/service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: '缺少用户 ID' },
        { status: 400 }
      );
    }

    const result = await AdminService.deleteUser(id);
    
    return NextResponse.json({
      success: true,
      message: `用户 ${result.deletedEmail} 已删除`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '删除用户失败';
    console.error('[Admin] Delete user error:', error);
    
    const status = message === '未登录' ? 401 
      : message === '无管理员权限' ? 403 
      : message.includes('不能删除') ? 400
      : 500;
    
    return NextResponse.json({ error: message }, { status });
  }
}
