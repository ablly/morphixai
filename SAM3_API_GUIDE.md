# Fal.ai SAM-3 API Integration Guide

## Overview

Morphix 使用 Fal.ai SAM-3 API 进行图像到 3D 模型的生成。

## API Endpoints

### 1. 3D Objects (物体生成)
- **Endpoint**: `fal-ai/sam-3/3d-objects`
- **用途**: 生成一般物体、产品、道具等的 3D 模型
- **文档**: https://fal.ai/models/fal-ai/sam-3/3d-objects/api

### 2. 3D Body (人体生成)
- **Endpoint**: `fal-ai/sam-3/3d-body`
- **用途**: 生成人体、角色等的 3D 模型
- **文档**: https://fal.ai/models/fal-ai/sam-3/3d-body/api

## API 调用方式

### 输入参数
```typescript
{
  image_url: string  // 源图片 URL (必需)
}
```

### 输出格式
```typescript
{
  model_mesh: {
    url: string  // GLB 模型文件 URL
  }
}
```

## 配置要求

### 1. 环境变量
```env
FAL_KEY=your-fal-api-key
NEXT_PUBLIC_APP_URL=https://your-domain.com  # 用于 webhook
```

### 2. Fal.ai 账户设置
1. 访问 https://fal.ai/dashboard/billing
2. 添加付款方式 (信用卡)
3. 确保 API Key 有 ADMIN scope 权限

### 3. API Key 创建
1. 访问 https://fal.ai/dashboard/keys
2. 创建新 Key，选择 **ADMIN** scope
3. 复制 Key 到 `.env.local` 的 `FAL_KEY`

## 错误处理

### 403 Forbidden
- **原因**: 账户没有付款方式或积分不足
- **解决**: 访问 https://fal.ai/dashboard/billing 添加付款方式

### 401 Unauthorized
- **原因**: API Key 无效或过期
- **解决**: 重新生成 API Key

### 404 Not Found
- **原因**: Endpoint 路径错误
- **解决**: 确认使用正确的 endpoint 路径

## Webhook 配置

Fal.ai 使用 webhook 通知生成完成：

```
POST /api/webhooks/fal
```

Webhook Payload 格式：
```json
{
  "request_id": "xxx",
  "status": "OK",
  "payload": {
    "model_mesh": {
      "url": "https://..."
    }
  }
}
```

## 定价参考

- SAM-3 3D Objects: ~$0.10-0.30 per generation
- SAM-3 3D Body: ~$0.15-0.40 per generation

具体价格请查看 https://fal.ai/pricing

## 本地测试

使用 ngrok 进行本地 webhook 测试：

```bash
ngrok http 3000
```

然后更新 `.env.local`:
```env
NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok-free.dev
```

## 代码位置

- 生成 API: `src/app/api/generate/route.ts`
- Webhook 处理: `src/app/api/webhooks/fal/route.ts`
- 前端页面: `src/app/[locale]/create/page.tsx`
