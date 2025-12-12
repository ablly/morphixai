import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/admin/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await AdminService.getReferrals(page, limit);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取邀请记录失败';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
