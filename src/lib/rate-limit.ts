/**
 * Rate Limiting Service
 * 
 * 生产环境建议:
 * 1. 使用 Redis 替代内存存储 (设置 REDIS_URL 环境变量)
 * 2. 使用 Upstash Redis 或 Vercel KV 用于 Serverless
 * 
 * 当前实现: 内存存储 (适用于单实例部署)
 */

// 内存存储
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;  // 时间窗口 (毫秒)
  maxRequests: number;  // 最大请求数
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  limit: number;
}

// 端点限制配置
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // 3D 生成 - 核心功能，限制较严
  'api:generate': { windowMs: 60000, maxRequests: 10 },  // 每分钟10次
  
  // 支付相关 - 防止滥用
  'api:checkout': { windowMs: 60000, maxRequests: 5 },   // 每分钟5次
  'api:subscription': { windowMs: 60000, maxRequests: 5 },
  
  // 社交分享 - 适度限制
  'api:share': { windowMs: 60000, maxRequests: 20 },     // 每分钟20次
  
  // 认证相关 - 防止暴力破解
  'api:auth': { windowMs: 300000, maxRequests: 10 },     // 5分钟10次
  'api:login': { windowMs: 300000, maxRequests: 5 },     // 5分钟5次登录尝试
  'api:signup': { windowMs: 3600000, maxRequests: 3 },   // 1小时3次注册
  'api:password-reset': { windowMs: 3600000, maxRequests: 3 },
  
  // 用户操作
  'api:profile': { windowMs: 60000, maxRequests: 30 },
  'api:credits': { windowMs: 60000, maxRequests: 60 },
  
  // 邮件发送
  'api:email': { windowMs: 60000, maxRequests: 5 },
  
  // 默认限制
  'api:default': { windowMs: 60000, maxRequests: 100 },
};

/**
 * 检查速率限制
 */
export function checkRateLimit(
  identifier: string,
  endpoint: string = 'api:default'
): RateLimitResult {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS['api:default'];
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();

  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    // 新窗口
    rateLimitMap.set(key, { count: 1, resetTime: now + config.windowMs });
    return { 
      allowed: true, 
      remaining: config.maxRequests - 1, 
      resetIn: config.windowMs,
      limit: config.maxRequests,
    };
  }

  if (record.count >= config.maxRequests) {
    // 超出限制
    return { 
      allowed: false, 
      remaining: 0, 
      resetIn: record.resetTime - now,
      limit: config.maxRequests,
    };
  }

  // 增加计数
  record.count++;
  return { 
    allowed: true, 
    remaining: config.maxRequests - record.count, 
    resetIn: record.resetTime - now,
    limit: config.maxRequests,
  };
}

/**
 * 获取速率限制状态 (不增加计数)
 */
export function getRateLimitStatus(
  identifier: string,
  endpoint: string = 'api:default'
): RateLimitResult {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS['api:default'];
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();

  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    return { 
      allowed: true, 
      remaining: config.maxRequests, 
      resetIn: config.windowMs,
      limit: config.maxRequests,
    };
  }

  return { 
    allowed: record.count < config.maxRequests, 
    remaining: Math.max(0, config.maxRequests - record.count), 
    resetIn: record.resetTime - now,
    limit: config.maxRequests,
  };
}

/**
 * 重置特定标识符的限制
 */
export function resetRateLimit(identifier: string, endpoint: string): void {
  const key = `${endpoint}:${identifier}`;
  rateLimitMap.delete(key);
}

/**
 * 生成速率限制响应头
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetIn / 1000).toString(),
  };
}

// 清理过期记录 (每5分钟运行一次)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.log(`[RateLimit] Cleaned ${cleaned} expired records`);
    }
  }, 300000);
}
