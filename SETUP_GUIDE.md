# Morphix AI - 第三方服务配置指南

## 1. Tripo3D API 配置 (3D 生成核心)

### 获取 API Key
1. 访问 [Tripo3D Platform](https://platform.tripo3d.ai/)
2. 注册/登录账户
3. 进入 [API Management](https://platform.tripo3d.ai/api-management)
4. 创建新的 API Key

### 配置
在 `.env.local` 中添加：
```bash
TRIPO3D_API_KEY=your_tripo3d_api_key
```

### 定价参考
- 文字转3D: ~$0.05/次
- 图片转3D: ~$0.05/次
- 多视角转3D: ~$0.08/次
- 骨骼绑定: ~$0.03/次

---

## 2. Stripe 配置 (支付系统)

### 获取 API Keys
1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 注册/登录账户
3. 进入 [API Keys](https://dashboard.stripe.com/apikeys)
4. 复制 Publishable key 和 Secret key

### 创建产品和价格
在 Stripe Dashboard > Products 中创建以下产品：

| 产品名称 | 积分数 | 价格 (USD) | 类型 |
|---------|-------|-----------|------|
| Starter | 20 | $4.99 | 一次性 |
| Basic | 100 | $14.99 | 一次性 |
| Standard | 300 | $29.99 | 一次性 |
| Pro | 1000 | $79.99 | 一次性 |
| Pro Monthly | 200/月 | $19.99/月 | 订阅 |
| Team Monthly | 500/月 | $39.99/月 | 订阅 |

### 配置 Webhook
1. 进入 [Webhooks](https://dashboard.stripe.com/webhooks)
2. 添加端点: `https://yourdomain.com/api/webhooks/stripe`
3. 选择事件:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. 复制 Webhook signing secret

### 配置环境变量
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## 3. Resend 配置 (邮件服务)

### 获取 API Key
1. 访问 [Resend](https://resend.com/)
2. 注册/登录账户
3. 进入 [API Keys](https://resend.com/api-keys)
4. 创建新的 API Key

### 配置域名 (生产环境)
1. 进入 [Domains](https://resend.com/domains)
2. 添加你的域名
3. 配置 DNS 记录 (MX, TXT)
4. 验证域名

### 配置环境变量
```bash
RESEND_API_KEY=re_xxx
EMAIL_FROM=Morphix AI <noreply@yourdomain.com>
```

---

## 4. Supabase 配置 (已完成)

当前项目已配置 Supabase:
- 项目 ID: `pmmzjaqefwquvbcdkfat`
- 区域: `us-east-2`

### 需要在 Dashboard 中配置:
1. **Authentication > Providers**
   - 启用 Email/Password
   - 配置 GitHub OAuth (可选)
   - 配置 Google OAuth (可选)

2. **Authentication > URL Configuration**
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: `https://yourdomain.com/auth/callback`

3. **Storage**
   - 创建 `generations` bucket (公开)

---

## 5. 验证配置

启动开发服务器后，访问健康检查端点验证配置：

```bash
curl http://localhost:3000/api/health
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

---

## 6. 测试模式

如果没有配置 `TRIPO3D_API_KEY`，系统会自动使用 Mock 模式：
- 生成请求会返回示例模型
- 适合开发和测试

如果没有配置 Stripe，支付功能将不可用。
