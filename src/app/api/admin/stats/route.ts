import { NextResponse } from 'next/server';
import { AdminService } from '@/lib/admin/service';

export async function GET() {
  try {
    const stats = await AdminService.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取统计失败';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
