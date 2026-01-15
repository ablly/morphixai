import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/admin/service';

export async function GET(request: NextRequest) {
  console.log('[Admin API] Payment intents request received');
  
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || undefined;

    console.log('[Admin API] Fetching payment intents:', { page, limit, status });
    
    const result = await AdminService.getPaymentIntents(page, limit, status);
    
    console.log('[Admin API] Payment intents result:', { 
      count: result.paymentIntents?.length,
      total: result.total,
      hasData: result.paymentIntents?.length > 0
    });
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取支付意向失败';
    console.error('[Admin API] Payment intents error:', error);
    console.error('[Admin API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: message },
      { status: message === '未登录' ? 401 : message === '无管理员权限' ? 403 : 500 }
    );
  }
}
