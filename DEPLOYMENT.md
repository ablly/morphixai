# Morphix AI - 生产环境部署指南

## 🌐 Vercel 一键部署

### 方法 1: 通过 Vercel Dashboard
1. 访问 [Vercel](https://vercel.com/)
2. 点击 "New Project"
3. 导入 GitHub 仓库
4. 配置环境变量 (见下方)
5. 点击 "Deploy"

### 方法 2: 通过 CLI
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 环境变量配置 (Vercel Dashboard)
在 Project Settings > Environment Variables 中添加：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `xxx` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `xxx` | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_xxx` | Production |
| `STRIPE_SECRET_KEY` | `sk_live_xxx` | Production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxx` | Production |
| `TRIPO3D_API_KEY` | `xxx` | Production |
| `RESEND_API_KEY` | `re_xxx` | Production |
| `EMAIL_FROM` | `Morphix AI <noreply@yourdomain.com>` | All |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` | Production |

---

## 🚀 部署前检查清单

### 1. 环境变量配置

确保在生产环境中配置以下环境变量：

```bash
# 必需 - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# 必需 - Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# 必需 - Tripo3D
TRIPO3D_API_KEY=xxx

# 必需 - Email
RESEND_API_KEY=re_xxx
EMAIL_FROM=Morphix AI <noreply@yourdomain.com>

# 必需 - App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. 数据库迁移

运行所有迁移脚本：

```bash
# 在 Supabase Dashboard SQL Editor 中执行
# 或使用 Supabase CLI
supabase db push
```

迁移文件：
- `supabase/migrations/001_initial_schema.sql` - 初始架构
- `supabase/migrations/002_add_generation_fields.sql` - 生成任务字段

### 3. Stripe 配置

1. 在 Stripe Dashboard 创建产品和价格
2. 配置 Webhook 端点: `https://yourdomain.com/api/webhooks/stripe`
3. 选择以下事件:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `charge.refunded`
   - `charge.dispute.created`

### 4. Supabase Storage

创建 `generations` bucket 用于存储上传的图片：

```sql
INSERT INTO storage.buckets (id, name, public) 
VALUES ('generations', 'generations', true);
```

### 5. 健康检查

部署后访问健康检查端点验证：

```
GET https://yourdomain.com/api/health
```

预期响应：
```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "ok" },
    "tripo3d": { "status": "ok" },
    "stripe": { "status": "ok" },
    "environment": { "status": "ok" }
  }
}
```

## 📊 监控建议

### 日志服务
- Vercel Logs (内置)
- Datadog
- LogRocket

### 错误追踪
- Sentry (推荐)
- Bugsnag

### 性能监控
- Vercel Analytics
- New Relic

## 🔒 安全检查

- [ ] 所有 API 端点都有认证保护
- [ ] Rate Limiting 已启用
- [ ] RLS 策略已在 Supabase 中配置
- [ ] 敏感环境变量未暴露给客户端
- [ ] CORS 配置正确
- [ ] Webhook 签名验证已启用

## 🌐 CDN 和缓存

建议配置：
- 静态资源缓存: 1 年
- API 响应: 不缓存 (no-store)
- 3D 模型文件: 1 周

## 📈 扩展建议

### 高流量场景
1. 使用 Redis 替代内存 Rate Limiting
2. 配置 Vercel Edge Functions
3. 使用 CDN 分发 3D 模型文件

### 数据库优化
1. 定期清理过期的生成记录
2. 添加数据库索引
3. 配置连接池

## 🆘 故障排除

### 常见问题

**Q: 3D 生成失败**
- 检查 TRIPO3D_API_KEY 是否正确
- 检查 Tripo3D 账户余额
- 查看 `/api/health` 端点状态

**Q: 支付失败**
- 检查 Stripe 密钥是否为生产密钥
- 验证 Webhook 签名密钥
- 查看 Stripe Dashboard 日志

**Q: 邮件发送失败**
- 验证 Resend API Key
- 检查发件人域名是否已验证
