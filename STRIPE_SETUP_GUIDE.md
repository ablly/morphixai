# Stripe 支付配置完整指南

## 📋 目录

1. [Stripe 账户设置](#1-stripe-账户设置)
2. [获取 API 密钥](#2-获取-api-密钥)
3. [配置 Webhook](#3-配置-webhook)
4. [测试支付流程](#4-测试支付流程)
5. [切换到生产环境](#5-切换到生产环境)
6. [常见问题排查](#6-常见问题排查)

---

## 1. Stripe 账户设置

### 1.1 注册/登录 Stripe

1. 访问 [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. 如果没有账户，点击 "Sign up" 注册
3. 完成邮箱验证

### 1.2 完成账户激活（生产环境必需）

1. 在 Dashboard 左侧菜单点击 **Settings** (齿轮图标)
2. 点击 **Business settings** > **Account details**
3. 填写以下信息：
   - Business name: `Morphix AI`
   - Business website: `https://你的域名.com`
   - Business type: 选择适合的类型
   - Country: 选择你的国家
4. 完成身份验证（需要上传身份证件）
5. 添加银行账户用于收款

---

## 2. 获取 API 密钥

### 2.1 获取测试密钥（开发环境）

1. 确保 Dashboard 右上角显示 **"Test mode"**（橙色标签）
2. 点击 **Developers** > **API keys**
3. 复制以下密钥：
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`（点击 "Reveal test key" 查看）

### 2.2 获取生产密钥（生产环境）

1. 关闭 "Test mode" 开关，切换到 Live mode
2. 点击 **Developers** > **API keys**
3. 复制以下密钥：
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...`

### 2.3 配置环境变量

在 `.env.local` 文件中设置：

```bash
# 测试环境
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# 生产环境（部署时使用）
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
# STRIPE_SECRET_KEY=sk_live_xxxxx
```

---

## 3. 配置 Webhook

Webhook 是 Stripe 通知你的服务器支付状态的方式，**非常重要**！

### 3.1 本地开发 - 使用 Stripe CLI

#### 安装 Stripe CLI

**Windows (使用 Scoop):**
```powershell
scoop install stripe
```

**Windows (手动下载):**
1. 访问 https://github.com/stripe/stripe-cli/releases
2. 下载 `stripe_x.x.x_windows_x86_64.zip`
3. 解压到一个目录，添加到 PATH

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

#### 登录 Stripe CLI

```bash
stripe login
```
按提示在浏览器中授权。

#### 转发 Webhook 到本地

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

运行后会显示：
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

复制这个 `whsec_xxxxx` 到 `.env.local`：
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 3.2 生产环境 - 在 Stripe Dashboard 配置

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com)
2. 确保在 **Live mode**（不是 Test mode）
3. 点击 **Developers** > **Webhooks**
4. 点击 **Add endpoint**
5. 填写：
   - **Endpoint URL**: `https://你的域名.com/api/webhooks/stripe`
   - **Description**: `Morphix AI Production Webhook`
6. 点击 **Select events** 选择以下事件：
   - ✅ `checkout.session.completed` - 支付完成
   - ✅ `invoice.paid` - 发票支付成功（订阅续费）
   - ✅ `invoice.payment_failed` - 支付失败
   - ✅ `customer.subscription.updated` - 订阅更新
   - ✅ `customer.subscription.deleted` - 订阅取消
   - ✅ `charge.refunded` - 退款
   - ✅ `charge.dispute.created` - 争议（可选）
7. 点击 **Add endpoint**
8. 创建后，点击 **Reveal** 查看 **Signing secret**
9. 复制 `whsec_...` 到生产环境变量

### 3.3 Vercel 环境变量配置

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 选择你的项目
3. 点击 **Settings** > **Environment Variables**
4. 添加以下变量：

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_xxxxx` | Production |
| `STRIPE_SECRET_KEY` | `sk_live_xxxxx` | Production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxxxx` | Production |

5. 点击 **Save**
6. 重新部署项目

---

## 4. 测试支付流程

### 4.1 测试卡号

在测试模式下使用以下卡号：

| 场景 | 卡号 | 有效期 | CVC |
|------|------|--------|-----|
| 成功支付 | `4242 4242 4242 4242` | 任意未来日期 | 任意3位 |
| 需要验证 | `4000 0025 0000 3155` | 任意未来日期 | 任意3位 |
| 支付失败 | `4000 0000 0000 0002` | 任意未来日期 | 任意3位 |
| 余额不足 | `4000 0000 0000 9995` | 任意未来日期 | 任意3位 |

### 4.2 测试流程

1. 启动本地开发服务器：
   ```bash
   npm run dev
   ```

2. 启动 Stripe CLI 监听：
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. 访问 `http://localhost:3000/zh/pricing`

4. 点击任意套餐的 "立即购买"

5. 在 Stripe Checkout 页面输入测试卡号

6. 完成支付后检查：
   - 是否跳转到成功页面
   - 数据库中积分是否增加
   - 交易记录是否创建

### 4.3 使用 Stripe CLI 触发测试事件

```bash
# 触发支付完成事件
stripe trigger checkout.session.completed

# 触发发票支付事件
stripe trigger invoice.paid

# 查看所有可触发的事件
stripe trigger --help
```

---

## 5. 切换到生产环境

### 5.1 检查清单

在切换到生产环境前，确保：

- [ ] Stripe 账户已激活（完成身份验证）
- [ ] 已添加银行账户
- [ ] 已配置生产环境 API 密钥
- [ ] 已配置生产环境 Webhook
- [ ] 已在 Vercel 设置环境变量
- [ ] 已测试完整支付流程

### 5.2 更新环境变量

将 `.env.local` 中的测试密钥替换为生产密钥：

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # 生产环境的 webhook secret
```

### 5.3 部署

```bash
git add .
git commit -m "Switch to Stripe production mode"
git push
```

Vercel 会自动部署。

---

## 6. 常见问题排查

### 6.1 支付后积分没有增加

**可能原因：**
1. Webhook 未配置或配置错误
2. Webhook Secret 不匹配
3. Webhook 端点无法访问

**排查步骤：**
1. 检查 Stripe Dashboard > Developers > Webhooks > 查看事件日志
2. 检查服务器日志中的 `[Stripe Webhook]` 输出
3. 确认 `STRIPE_WEBHOOK_SECRET` 正确

### 6.2 Webhook 签名验证失败

**错误信息：** `Webhook signature verification failed`

**解决方案：**
1. 确保 `STRIPE_WEBHOOK_SECRET` 是正确的
2. 本地开发时，使用 `stripe listen` 输出的 secret
3. 生产环境使用 Dashboard 中的 Signing secret

### 6.3 API 版本不兼容

**错误信息：** `Invalid API version`

**解决方案：**
检查 `src/lib/stripe/server.ts` 中的 `apiVersion`，确保与 Stripe SDK 版本兼容。

### 6.4 支付页面无法加载

**可能原因：**
1. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` 未设置
2. 网络问题

**解决方案：**
1. 检查环境变量是否正确设置
2. 检查浏览器控制台错误

---

## 📞 支持

如果遇到问题：
1. 查看 [Stripe 官方文档](https://stripe.com/docs)
2. 查看 [Stripe API 参考](https://stripe.com/docs/api)
3. 联系 Stripe 支持

---

## 📊 当前套餐配置

| 套餐 | 积分 | 价格 | 单价 | 可生成模型数 |
|------|------|------|------|-------------|
| Starter | 1,000 | $9.90 | $0.0099/积分 | ~110 |
| Creator | 3,500 | $29.90 | $0.0085/积分 | ~380 |
| Pro | 12,000 | $99.90 | $0.0083/积分 | ~1,330 |

**首单优惠：** 85折

**积分消耗：**
- 标准生成：9 积分
- 人体生成：9 积分
- 下载（Starter/Free）：5 积分
- 下载（Creator/Pro）：免费
- 私密模式：+5 积分
- 优先队列：+2 积分
- 商业授权：100 积分
