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
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    const result = await AdminService.updateUserCredits(id, amount, reason);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新积分失败';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
