import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/admin/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || undefined;

    const result = await AdminService.getGenerations(page, limit, status);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Admin generations error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch generations' },
      { status: error.message === '未登录' ? 401 : error.message === '无管理员权限' ? 403 : 500 }
    );
  }
}
