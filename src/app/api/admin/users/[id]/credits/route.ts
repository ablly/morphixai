import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/admin/service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { amount, reason } = await request.json();

    if (typeof amount !== 'number' || !reason) {
      return NextResponse.json(
        { error: '请提供有效的积分数量和原因' },
        { status: 400 }
      );
    }

    const result = await AdminService.updateUserCredits(id, amount, reason);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Admin update credits error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update credits' },
      { status: error.message === '未登录' ? 401 : error.message === '无管理员权限' ? 403 : 500 }
    );
  }
}
