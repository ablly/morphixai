import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/admin/service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await AdminService.getUserDetail(id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取用户详情失败';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
