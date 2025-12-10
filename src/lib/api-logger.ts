/**
 * API 日志服务
 * 
 * 用于记录 API 请求和响应，便于:
 * - 性能监控
 * - 错误追踪
 * - 使用分析
 */

import { NextRequest } from 'next/server';

interface LogEntry {
  timestamp: string;
  method: string;
  path: string;
  userId?: string;
  statusCode?: number;
  responseTimeMs?: number;
  error?: string;
  ip?: string;
  userAgent?: string;
}

// 内存日志缓冲 (生产环境应发送到日志服务)
const logBuffer: LogEntry[] = [];
const MAX_BUFFER_SIZE = 1000;

/**
 * 记录 API 请求
 */
export function logApiRequest(
  request: NextRequest,
  userId?: string,
  statusCode?: number,
  responseTimeMs?: number,
  error?: string
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    method: request.method,
    path: new URL(request.url).pathname,
    userId,
    statusCode,
    responseTimeMs,
    error,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  };

  // 添加到缓冲
  logBuffer.push(entry);
  
  // 限制缓冲大小
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.shift();
  }

  // 控制台输出 (生产环境可以发送到日志服务)
  const logLevel = statusCode && statusCode >= 400 ? 'error' : 'info';
  const logFn = logLevel === 'error' ? console.error : console.log;
  
  logFn(
    `[API] ${entry.method} ${entry.path} ${statusCode || '-'} ${responseTimeMs || '-'}ms`,
    userId ? `user:${userId.substring(0, 8)}` : '',
    error ? `error:${error}` : ''
  );
}

/**
 * 获取最近的日志 (用于调试)
 */
export function getRecentLogs(limit = 100): LogEntry[] {
  return logBuffer.slice(-limit);
}

/**
 * 获取 API 统计
 */
export function getApiStats(): {
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  topEndpoints: { path: string; count: number }[];
} {
  const total = logBuffer.length;
  const errors = logBuffer.filter(l => l.statusCode && l.statusCode >= 400).length;
  const responseTimes = logBuffer.filter(l => l.responseTimeMs).map(l => l.responseTimeMs!);
  const avgResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
    : 0;

  // 统计端点访问次数
  const endpointCounts: Record<string, number> = {};
  logBuffer.forEach(l => {
    endpointCounts[l.path] = (endpointCounts[l.path] || 0) + 1;
  });
  const topEndpoints = Object.entries(endpointCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  return {
    totalRequests: total,
    errorRate: total > 0 ? errors / total : 0,
    avgResponseTime: Math.round(avgResponseTime),
    topEndpoints,
  };
}

/**
 * 创建 API 响应计时器
 */
export function createApiTimer() {
  const startTime = Date.now();
  return {
    getElapsed: () => Date.now() - startTime,
  };
}
