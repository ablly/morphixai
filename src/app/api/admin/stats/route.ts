import { NextResponse } from 'next/server';
import { AdminService } from '@/lib/admin/service';

export async function GET() {
  try {
    const stats = await AdminService.getStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: error.message === '未登录' ? 401 : error.message === '无管理员权限' ? 403 : 500 }
    );
  }
}
