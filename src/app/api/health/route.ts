import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isTripoConfigured } from '@/lib/tripo3d/service';

/**
 * 健康检查端点
 * 
 * 用于:
 * - 负载均衡器健康检查
 * - 监控系统 (Datadog, New Relic, etc.)
 * - CI/CD 部署验证
 */
export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: 'ok' | 'error'; latency?: number; message?: string }> = {};

  // 检查 Supabase 连接
  try {
    const supabase = await createClient();
    const dbStart = Date.now();
    const { error } = await supabase.from('credit_packages').select('id').limit(1);
    checks.database = {
      status: error ? 'error' : 'ok',
      latency: Date.now() - dbStart,
      message: error?.message,
    };
  } catch (e: any) {
    checks.database = { status: 'error', message: e.message };
  }

  // 检查 Tripo3D API 配置
  checks.tripo3d = {
    status: isTripoConfigured() ? 'ok' : 'error',
    message: isTripoConfigured() ? undefined : 'API key not configured',
  };

  // 检查 Stripe 配置
  checks.stripe = {
    status: process.env.STRIPE_SECRET_KEY ? 'ok' : 'error',
    message: process.env.STRIPE_SECRET_KEY ? undefined : 'Not configured',
  };

  // 检查环境变量
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_URL',
  ];
  const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
  checks.environment = {
    status: missingEnvVars.length === 0 ? 'ok' : 'error',
    message: missingEnvVars.length > 0 ? `Missing: ${missingEnvVars.join(', ')}` : undefined,
  };

  // 总体状态
  const allOk = Object.values(checks).every(c => c.status === 'ok');
  const totalLatency = Date.now() - startTime;

  return NextResponse.json({
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    latency: totalLatency,
    version: process.env.npm_package_version || '1.0.0',
    checks,
  }, {
    status: allOk ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
