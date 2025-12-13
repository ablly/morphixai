import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * 健康检查 API
 * 用于验证服务和数据库连接状态
 */
export async function GET() {
  const checks: Record<string, { status: 'ok' | 'error'; message?: string; latency?: number }> = {};
  
  // 1. 检查 Supabase 连接
  try {
    const start = Date.now();
    const supabase = await createAdminClient();
    const { error } = await supabase.from('profiles').select('id').limit(1);
    const latency = Date.now() - start;
    
    if (error) {
      checks.database = { status: 'error', message: error.message };
    } else {
      checks.database = { status: 'ok', latency };
    }
  } catch (error: any) {
    checks.database = { status: 'error', message: error.message };
  }

  // 2. 检查环境变量
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'FAL_KEY',
  ];

  const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missingEnvVars.length > 0) {
    checks.environment = { 
      status: 'error', 
      message: `Missing: ${missingEnvVars.join(', ')}` 
    };
  } else {
    checks.environment = { status: 'ok' };
  }

  // 3. 检查 Realtime 配置
  try {
    const supabase = await createAdminClient();
    // 简单测试 - 尝试创建一个 channel
    const channel = supabase.channel('health-check');
    await channel.subscribe();
    await supabase.removeChannel(channel);
    checks.realtime = { status: 'ok' };
  } catch (error: any) {
    checks.realtime = { status: 'error', message: error.message };
  }

  // 计算总体状态
  const allOk = Object.values(checks).every(c => c.status === 'ok');
  
  return NextResponse.json({
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  }, { status: allOk ? 200 : 503 });
}
