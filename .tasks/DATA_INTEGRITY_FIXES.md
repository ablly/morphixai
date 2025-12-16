# 数据完整性修复报告

## 修复日期: 2025-12-13

## 发现的问题

### 1. RLS (Row Level Security) 绕过问题
**问题**: Webhook 和后台服务使用普通客户端 (`createClient`)，受 RLS 策略限制，导致数据无法正确写入。

**影响范围**:
- Stripe webhook 无法正确添加积分
- Fal.ai webhook 无法更新生成状态
- 邀请奖励无法正确发放
- 社交分享奖励无法正确发放

**修复**: 所有后台服务和 webhook 改用 `createAdminClient`，使用 service role key 绕过 RLS。

### 2. Admin 客户端实现问题
**问题**: `createAdminClient` 依赖 cookies，但 webhook 请求没有用户 session。

**修复**: 重写 `createAdminClient`，使用 `@supabase/supabase-js` 直接创建客户端，不依赖 cookies。

### 3. 实时订阅未过滤用户
**问题**: 前端实时订阅监听所有用户的数据变化，可能导致数据混乱。

**修复**: 添加 `filter` 参数，只监听当前用户的数据变化。

### 4. 重复处理防护缺失
**问题**: Stripe webhook 可能重复处理同一个 checkout session。

**修复**: 在处理前检查是否已存在相同 `reference_id` 的交易记录。

## 修改的文件

### 核心服务
- `src/lib/supabase/server.ts` - 重写 admin 客户端
- `src/lib/credits/service.ts` - 使用 admin 客户端
- `src/lib/stripe/service.ts` - 使用 admin 客户端，增强错误处理
- `src/lib/referral/service.ts` - 使用 admin 客户端
- `src/lib/social/service.ts` - 使用 admin 客户端

### Webhook 路由
- `src/app/api/webhooks/stripe/route.ts` - 使用 admin 客户端
- `src/app/api/webhooks/fal/route.ts` - 使用 admin 客户端

### 前端页面
- `src/app/[locale]/dashboard/page.tsx` - 修复实时订阅过滤
- `src/app/[locale]/create/page.tsx` - 修复实时订阅过滤

### 新增文件
- `src/app/api/admin/data-integrity/route.ts` - 数据完整性检查 API
- `src/app/api/health/route.ts` - 健康检查 API

## 验证步骤

1. **测试 Stripe 支付**:
   - 完成一次购买
   - 验证积分是否正确添加
   - 检查交易记录是否创建

2. **测试 3D 生成**:
   - 提交一个生成任务
   - 验证积分是否正确扣除
   - 验证 webhook 是否正确更新状态

3. **测试实时更新**:
   - 在 dashboard 页面
   - 在另一个标签页完成操作
   - 验证数据是否实时更新

4. **运行健康检查**:
   ```
   GET /api/health
   ```

5. **运行数据完整性检查** (需要管理员权限):
   ```
   GET /api/admin/data-integrity
   ```

## 注意事项

- 确保 `SUPABASE_SERVICE_ROLE_KEY` 环境变量已正确配置
- Service role key 具有完全权限，请妥善保管
- 生产环境中应定期运行数据完整性检查
