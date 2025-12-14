import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/admin/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || undefined;

    const result = await AdminService.getPaymentIntents(page, limit, status);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取支付意向失败';
    console.error('[Admin] Payment intents error:', error);
    
    return NextResponse.json(
      { error: message },
      { status: message === '未登录' ? 401 : message === '无管理员权限' ? 403 : 500 }
    );
  }
}
