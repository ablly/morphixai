# 腾讯混元生3D API 完整指南

> 生成日期: 2025-12-11
> 官方文档: https://cloud.tencent.com/document/product/1804
> 计费说明: https://cloud.tencent.com/document/product/1804/117069

---

## 目录

1. [产品概述](#1-产品概述)
2. [API 定价与积分消耗详情](#2-api-定价与积分消耗详情)
3. [API 接口详细说明](#3-api-接口详细说明)
4. [认证与签名配置](#4-认证与签名配置)
5. [代码集成示例](#5-代码集成示例)
6. [与 Tripo3D 成本对比分析](#6-与-tripo3d-成本对比分析)
7. [迁移与集成建议](#7-迁移与集成建议)

---

## 1. 产品概述

### 1.1 产品系列

腾讯混元生3D 提供两个版本：

| 版本 | 说明 | 默认并发 |
|------|------|----------|
| **混元生3D（专业版）** | 功能完整，支持多种生成模式 | 3个并发 |
| **混元生3D（极速版）** | 快速生成，功能精简 | 1个并发 |

### 1.2 核心能力

| 能力 | 专业版 | 极速版 |
|------|--------|--------|
| 文生3D | ✅ | ✅ |
| 图生3D | ✅ | ✅ |
| 多视角生成 | ✅ | ❌ |
| PBR材质 | ✅ | ✅ |
| 智能减面 (LowPoly) | ✅ | ❌ |
| 白模生成 (Geometry) | ✅ | ❌ |
| 草图生成 (Sketch) | ✅ | ❌ |
| 自定义面数 | ✅ | ❌ |

### 1.3 免费额度

| 产品 | 免费额度 | 有效期 | 说明 |
|------|----------|--------|------|
| 混元生3D | **100积分/用户** | 1年 | 需在控制台手动领取 |


---

## 2. API 定价与积分消耗详情

### 2.1 计费模式

| 计费方式 | 单价 | 说明 |
|----------|------|------|
| **后付费（按积分）** | **¥0.12/积分** | 按日结算，用多少付多少 |
| 预付费资源包 | ¥0.09-0.10/积分 | 批量购买更便宜，1年有效期 |

### 2.2 预付费资源包定价

| 资源包 | 价格 | 积分 | 单价 | 折扣 | 有效期 |
|--------|------|------|------|------|--------|
| 1,000积分包 | ¥100 | 1,000 | **¥0.10** | 17% | 1年 |
| 10,000积分包 | ¥980 | 10,000 | **¥0.098** | 18% | 1年 |
| 50,000积分包 | ¥4,750 | 50,000 | **¥0.095** | 21% | 1年 |
| 100,000积分包 | ¥9,000 | 100,000 | **¥0.09** | 25% | 1年 |

### 2.3 并发叠加包（可选）

| 接口 | 默认并发 | 叠加包价格 |
|------|----------|------------|
| 混元生3D（专业版） | 3个 | ¥30,000/并发/月 |
| 混元生3D（极速版） | 1个 | ¥30,000/并发/月 |

---

### 2.4 ⭐ 混元生3D（专业版）积分消耗详情

#### 2.4.1 生成任务类型（必选，四选一）

| GenerateType | 功能描述 | 消耗积分 |
|--------------|----------|----------|
| **Normal** | 生成带纹理的几何模型（默认） | **20积分** |
| **LowPoly** | 生成智能减面后带纹理的几何模型 | **25积分** |
| **Geometry** | 生成不带纹理的几何模型（白模） | **15积分** |
| **Sketch** | 输入草图/线稿图生成带纹理的几何模型 | **25积分** |

#### 2.4.2 附加参数（可选，可多选叠加）

| 参数 | 功能描述 | 额外消耗积分 |
|------|----------|--------------|
| **MultiViewImages** | 通过多视图生成3D模型 | **+10积分** |
| **EnablePBR** | 生成带PBR材质（金属度/粗糙度/法线贴图） | **+10积分** |
| **FaceCount** | 生成自定义面数的3D模型 | **+10积分** |

#### 2.4.3 专业版积分消耗示例

| 场景 | 计算 | 总消耗 |
|------|------|--------|
| 图生3D（默认） | Normal = 20 | **20积分** |
| 图生3D + PBR | Normal(20) + PBR(10) | **30积分** |
| 图生3D + PBR + 自定义面数 | Normal(20) + PBR(10) + FaceCount(10) | **40积分** |
| 多视角生成 + PBR | Normal(20) + MultiView(10) + PBR(10) | **40积分** |
| LowPoly + PBR | LowPoly(25) + PBR(10) | **35积分** |
| 草图生成 + PBR | Sketch(25) + PBR(10) | **35积分** |
| 白模生成 | Geometry = 15 | **15积分** |

---

### 2.5 ⭐ 混元生3D（极速版）积分消耗详情

#### 2.5.1 基础生成

| 参数 | 功能描述 | 消耗积分 |
|------|----------|----------|
| **Prompt** | 通过文字生成3D模型 | **15积分** |
| **ImageUrl/ImageBase64** | 通过图片生成3D模型 | **15积分** |

#### 2.5.2 附加参数（可选）

| 参数 | 功能描述 | 额外消耗积分 |
|------|----------|--------------|
| **EnablePBR** | 生成带PBR材质 | **+10积分** |

#### 2.5.3 极速版积分消耗示例

| 场景 | 计算 | 总消耗 |
|------|------|--------|
| 图生3D（默认） | 15 | **15积分** |
| 图生3D + PBR | 15 + 10 | **25积分** |
| 文生3D | 15 | **15积分** |
| 文生3D + PBR | 15 + 10 | **25积分** |

---

### 2.6 成本计算表（按后付费 ¥0.12/积分）

#### 专业版成本

| 场景 | 积分 | 后付费成本 | 资源包成本(¥0.09) |
|------|------|------------|-------------------|
| 图生3D（默认） | 20 | **¥2.40** (~$0.33) | **¥1.80** (~$0.25) |
| 图生3D + PBR | 30 | **¥3.60** (~$0.50) | **¥2.70** (~$0.38) |
| 多视角 + PBR | 40 | **¥4.80** (~$0.67) | **¥3.60** (~$0.50) |
| LowPoly + PBR | 35 | **¥4.20** (~$0.58) | **¥3.15** (~$0.44) |
| 白模生成 | 15 | **¥1.80** (~$0.25) | **¥1.35** (~$0.19) |

#### 极速版成本

| 场景 | 积分 | 后付费成本 | 资源包成本(¥0.09) |
|------|------|------------|-------------------|
| 图/文生3D（默认） | 15 | **¥1.80** (~$0.25) | **¥1.35** (~$0.19) |
| 图/文生3D + PBR | 25 | **¥3.00** (~$0.42) | **¥2.25** (~$0.31) |


---

## 3. API 接口详细说明

### 3.1 基本信息

| 项目 | 专业版 | 极速版 |
|------|--------|--------|
| **接口域名** | ai3d.tencentcloudapi.com | ai3d.tencentcloudapi.com |
| **接口名称** | SubmitHunyuanTo3DProJob | SubmitHunyuanTo3DJob |
| **API版本** | 2025-05-13 | 2025-05-13 |

### 3.2 专业版请求参数

| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| **Prompt** | 否* | String | 文生3D描述，最多1024字符 |
| **ImageUrl** | 否* | String | 图片URL（与Prompt/ImageBase64三选一） |
| **ImageBase64** | 否* | String | 图片Base64编码 |
| **MultiViewImages** | 否 | Array | 多视角图片（left/right/back） |
| **EnablePBR** | 否 | Boolean | 开启PBR材质，默认false |
| **FaceCount** | 否 | Integer | 面数，默认500000，范围40000-1500000 |
| **GenerateType** | 否 | String | Normal/LowPoly/Geometry/Sketch |
| **PolygonType** | 否 | String | triangle/quadrilateral（仅LowPoly） |

> *注: Prompt、ImageUrl、ImageBase64 必填其一

### 3.3 图片要求

| 限制项 | 要求 |
|--------|------|
| 分辨率 | 128-5000像素 |
| 文件大小 | ≤8MB（建议≤5MB） |
| 格式 | jpg, png, jpeg, webp |

### 3.4 GenerateType 详解

| 值 | 说明 | 积分 |
|----|------|------|
| **Normal** | 默认，带纹理的几何模型 | 20 |
| **LowPoly** | 智能减面，可选四边形网格 | 25 |
| **Geometry** | 白模，不带纹理，EnablePBR不生效 | 15 |
| **Sketch** | 草图模式，Prompt和图片可同时输入 | 25 |

### 3.5 响应参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| **JobId** | String | 任务ID，有效期24小时 |
| RequestId | String | 请求唯一ID |

### 3.6 请求示例

**图生3D（默认，20积分）**:
```json
{
    "ImageUrl": "https://example.com/input.png"
}
```

**图生3D + PBR（30积分）**:
```json
{
    "ImageUrl": "https://example.com/input.png",
    "EnablePBR": true
}
```

**图生3D + PBR + 自定义面数（40积分）**:
```json
{
    "ImageUrl": "https://example.com/input.png",
    "EnablePBR": true,
    "FaceCount": 400000
}
```

**LowPoly + PBR + 四边形（35积分）**:
```json
{
    "ImageUrl": "https://example.com/input.png",
    "GenerateType": "LowPoly",
    "PolygonType": "quadrilateral",
    "EnablePBR": true
}
```

**草图生成（25积分）**:
```json
{
    "ImageUrl": "https://example.com/sketch.png",
    "Prompt": "一只可爱的小猫",
    "GenerateType": "Sketch"
}
```

**白模生成（15积分）**:
```json
{
    "ImageUrl": "https://example.com/input.png",
    "GenerateType": "Geometry"
}
```

---

## 4. 认证与签名配置

### 4.1 获取密钥

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入 **访问管理** > **API密钥管理**
3. 创建密钥获取:
   - `SecretId`: 身份标识
   - `SecretKey`: 签名密钥

### 4.2 环境变量

```bash
# .env.local
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
TENCENT_REGION=ap-guangzhou
```

### 4.3 签名算法

使用 **TC3-HMAC-SHA256** 签名算法。

**请求头**:
```
Host: ai3d.tencentcloudapi.com
Content-Type: application/json
X-TC-Action: SubmitHunyuanTo3DProJob
X-TC-Version: 2025-05-13
X-TC-Timestamp: 1234567890
X-TC-Region: ap-guangzhou
Authorization: TC3-HMAC-SHA256 Credential=xxx/date/ai3d/tc3_request, SignedHeaders=..., Signature=xxx
```

### 4.4 SDK 安装

```bash
npm install tencentcloud-sdk-nodejs
```


---

## 5. 代码集成示例

### 5.1 TypeScript 服务封装

```typescript
// src/lib/hunyuan3d/service.ts
import crypto from 'crypto';

const API_HOST = 'ai3d.tencentcloudapi.com';
const SERVICE = 'ai3d';
const VERSION = '2025-05-13';

type GenerateType = 'Normal' | 'LowPoly' | 'Geometry' | 'Sketch';

interface GenerationOptions {
  enablePBR?: boolean;
  faceCount?: number;
  generateType?: GenerateType;
  polygonType?: 'triangle' | 'quadrilateral';
  multiViewImages?: Array<{ viewAngle: string; imageUrl: string }>;
}

// TC3-HMAC-SHA256 签名
function sign(secretId: string, secretKey: string, action: string, payload: string, timestamp: number): string {
  const date = new Date(timestamp * 1000).toISOString().split('T')[0];
  const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${API_HOST}\nx-tc-action:${action.toLowerCase()}\n`;
  const signedHeaders = 'content-type;host;x-tc-action';
  const hashedPayload = crypto.createHash('sha256').update(payload).digest('hex');
  
  const canonicalRequest = ['POST', '/', '', canonicalHeaders, signedHeaders, hashedPayload].join('\n');
  const credentialScope = `${date}/${SERVICE}/tc3_request`;
  const stringToSign = ['TC3-HMAC-SHA256', timestamp, credentialScope, 
    crypto.createHash('sha256').update(canonicalRequest).digest('hex')].join('\n');

  const secretDate = crypto.createHmac('sha256', Buffer.from(`TC3${secretKey}`)).update(date).digest();
  const secretService = crypto.createHmac('sha256', secretDate).update(SERVICE).digest();
  const secretSigning = crypto.createHmac('sha256', secretService).update('tc3_request').digest();
  const signature = crypto.createHmac('sha256', secretSigning).update(stringToSign).digest('hex');

  return `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

// 调用API
async function callApi(action: string, payload: object): Promise<any> {
  const secretId = process.env.TENCENT_SECRET_ID!;
  const secretKey = process.env.TENCENT_SECRET_KEY!;
  const region = process.env.TENCENT_REGION || 'ap-guangzhou';
  
  const timestamp = Math.floor(Date.now() / 1000);
  const payloadStr = JSON.stringify(payload);
  const authorization = sign(secretId, secretKey, action, payloadStr, timestamp);

  const response = await fetch(`https://${API_HOST}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Host': API_HOST,
      'X-TC-Action': action,
      'X-TC-Version': VERSION,
      'X-TC-Timestamp': timestamp.toString(),
      'X-TC-Region': region,
      'Authorization': authorization,
    },
    body: payloadStr,
  });

  const data = await response.json();
  if (data.Response?.Error) {
    throw new Error(`${data.Response.Error.Code}: ${data.Response.Error.Message}`);
  }
  return data.Response;
}

// 专业版：图生3D
export async function imageToModel(imageUrl: string, options: GenerationOptions = {}) {
  return callApi('SubmitHunyuanTo3DProJob', {
    ImageUrl: imageUrl,
    EnablePBR: options.enablePBR ?? false,
    FaceCount: options.faceCount,
    GenerateType: options.generateType ?? 'Normal',
    PolygonType: options.polygonType,
  });
}

// 专业版：文生3D
export async function textToModel(prompt: string, options: GenerationOptions = {}) {
  return callApi('SubmitHunyuanTo3DProJob', {
    Prompt: prompt,
    EnablePBR: options.enablePBR ?? false,
    GenerateType: options.generateType ?? 'Normal',
  });
}

// 专业版：多视角生成
export async function multiviewToModel(
  mainImageUrl: string, 
  multiViewImages: Array<{ viewAngle: string; imageUrl: string }>,
  options: GenerationOptions = {}
) {
  return callApi('SubmitHunyuanTo3DProJob', {
    ImageUrl: mainImageUrl,
    MultiViewImages: multiViewImages.map(v => ({
      ViewAngle: v.viewAngle,
      ImageUrl: v.imageUrl,
    })),
    EnablePBR: options.enablePBR ?? false,
  });
}

// 极速版：图/文生3D
export async function fastGenerate(params: { prompt?: string; imageUrl?: string; enablePBR?: boolean }) {
  return callApi('SubmitHunyuanTo3DJob', {
    Prompt: params.prompt,
    ImageUrl: params.imageUrl,
    EnablePBR: params.enablePBR ?? false,
  });
}

export const isHunyuanConfigured = () => 
  !!(process.env.TENCENT_SECRET_ID && process.env.TENCENT_SECRET_KEY);
```


---

## 6. 与 Tripo3D 成本对比分析

### 6.1 定价体系对比

| 项目 | 腾讯混元3D | Tripo3D |
|------|-----------|---------|
| 计费单位 | 积分 | 积分 |
| 后付费单价 | ¥0.12/积分 (~$0.017) | $0.01/积分 |
| 资源包最低价 | ¥0.09/积分 (~$0.013) | $0.0053/积分 (Pro套餐) |

### 6.2 ⭐ 核心功能成本对比

#### 图生3D（标准纹理）

| 服务商 | 积分消耗 | 后付费成本 | 资源包成本 |
|--------|----------|------------|------------|
| **混元3D 专业版** | 20积分 | ¥2.40 (~$0.33) | ¥1.80 (~$0.25) |
| **混元3D 极速版** | 15积分 | ¥1.80 (~$0.25) | ¥1.35 (~$0.19) |
| **Tripo3D** | 20积分 | **$0.20** | **$0.11** |

#### 图生3D + PBR材质

| 服务商 | 积分消耗 | 后付费成本 | 资源包成本 |
|--------|----------|------------|------------|
| **混元3D 专业版** | 30积分 | ¥3.60 (~$0.50) | ¥2.70 (~$0.38) |
| **混元3D 极速版** | 25积分 | ¥3.00 (~$0.42) | ¥2.25 (~$0.31) |
| **Tripo3D** | 20积分 (默认含PBR) | **$0.20** | **$0.11** |

#### 文生3D

| 服务商 | 积分消耗 | 后付费成本 | 资源包成本 |
|--------|----------|------------|------------|
| **混元3D 专业版** | 20积分 | ¥2.40 (~$0.33) | ¥1.80 (~$0.25) |
| **混元3D 极速版** | 15积分 | ¥1.80 (~$0.25) | ¥1.35 (~$0.19) |
| **Tripo3D** | 10积分 | **$0.10** | **$0.05** |

### 6.3 功能对比

| 功能 | 混元3D 专业版 | 混元3D 极速版 | Tripo3D |
|------|--------------|--------------|---------|
| 文生3D | ✅ 20积分 | ✅ 15积分 | ✅ 10积分 |
| 图生3D | ✅ 20积分 | ✅ 15积分 | ✅ 20积分 |
| 多视角生成 | ✅ +10积分 | ❌ | ✅ 20积分 |
| PBR材质 | ✅ +10积分 | ✅ +10积分 | ✅ 默认包含 |
| 智能减面 | ✅ 25积分 | ❌ | ✅ 10积分 |
| 白模生成 | ✅ 15积分 | ❌ | ✅ 7积分 |
| 草图生成 | ✅ 25积分 | ❌ | ❌ |
| 自定义面数 | ✅ +10积分 | ❌ | ✅ 包含 |
| **骨骼绑定** | ❌ | ❌ | ✅ 25积分 |
| **部件分割** | ❌ | ❌ | ✅ 40积分 |
| **动画重定向** | ❌ | ❌ | ✅ 10积分/动画 |

### 6.4 ⭐ 利润率对比分析

假设你收费 **10 Morphix积分 = $1.00** (按 Standard 包 $0.10/积分):

#### 图生3D（标准）

| 服务商 | API成本 | 你的收入 | 利润 | 利润率 |
|--------|---------|----------|------|--------|
| 混元3D 专业版 (后付费) | $0.33 | $1.00 | $0.67 | **67%** |
| 混元3D 专业版 (资源包) | $0.25 | $1.00 | $0.75 | **75%** |
| 混元3D 极速版 (后付费) | $0.25 | $1.00 | $0.75 | **75%** |
| 混元3D 极速版 (资源包) | $0.19 | $1.00 | $0.81 | **81%** |
| **Tripo3D** | $0.20 | $1.00 | $0.80 | **80%** |

#### 图生3D + PBR

| 服务商 | API成本 | 你的收入 | 利润 | 利润率 |
|--------|---------|----------|------|--------|
| 混元3D 专业版 (后付费) | $0.50 | $1.50 | $1.00 | **67%** |
| 混元3D 专业版 (资源包) | $0.38 | $1.50 | $1.12 | **75%** |
| **Tripo3D** (默认含PBR) | $0.20 | $1.00 | $0.80 | **80%** |

### 6.5 综合评估

| 维度 | 混元3D | Tripo3D | 胜出 |
|------|--------|---------|------|
| **基础功能成本** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Tripo |
| **高级功能** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Tripo |
| **国内访问速度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 混元 |
| **中文支持** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 混元 |
| **草图生成** | ⭐⭐⭐⭐⭐ | ❌ | 混元 |
| **骨骼/动画** | ❌ | ⭐⭐⭐⭐⭐ | Tripo |
| **利润率** | 67-81% | **80%** | Tripo |

---

## 7. 迁移与集成建议

### 7.1 ⭐ 核心结论

**Tripo3D 在成本上更有优势：**
- 图生3D: Tripo $0.20 vs 混元 $0.25-0.33
- 文生3D: Tripo $0.10 vs 混元 $0.25-0.33
- PBR材质: Tripo 默认包含 vs 混元 额外+10积分

**混元3D 的优势场景：**
- 国内用户访问速度快
- 中文提示词理解更好
- 独有草图/线稿生成功能

### 7.2 推荐策略

```
场景1: 主要面向国内用户
  → 使用混元3D（极速版）
  → 成本: ¥1.35-1.80/次
  → 优势: 访问快、中文好

场景2: 需要骨骼绑定/部件分割/动画
  → 必须使用 Tripo3D
  → 混元3D 不支持这些功能

场景3: 追求最高利润率
  → 使用 Tripo3D
  → 利润率: 80%

场景4: 草图/线稿生成
  → 使用混元3D（专业版）
  → Tripo3D 不支持
```

### 7.3 环境变量配置

```bash
# .env.local

# 腾讯混元3D
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
TENCENT_REGION=ap-guangzhou

# Tripo3D (高级功能)
TRIPO3D_API_KEY=your_tripo_api_key
```

### 7.4 费用计算示例

**示例1: 使用混元3D专业版 LowPoly + PBR**
```
积分消耗: 25 + 10 = 35积分
后付费成本: 35 × ¥0.12 = ¥4.20 (~$0.58)
资源包成本: 35 × ¥0.09 = ¥3.15 (~$0.44)
```

**示例2: 年消耗30,000积分，购买资源包**
```
购买: 3 × 10,000积分包 = 3 × ¥980 = ¥2,940
单价: ¥0.098/积分
vs 后付费: 30,000 × ¥0.12 = ¥3,600
节省: ¥660 (18%)
```

---

## 附录

### A. 官方资源链接

| 资源 | 链接 |
|------|------|
| 产品页面 | https://cloud.tencent.com/product/ai3d |
| API文档 | https://cloud.tencent.com/document/product/1804/123447 |
| 计费说明 | https://cloud.tencent.com/document/product/1804/117069 |
| 控制台 | https://console.cloud.tencent.com/ai3d |
| 购买页 | https://buy.cloud.tencent.com/ai3d |

### B. 积分消耗速查表

#### 专业版

| 场景 | 积分 | 后付费 | 资源包 |
|------|------|--------|--------|
| Normal (默认) | 20 | ¥2.40 | ¥1.80 |
| Normal + PBR | 30 | ¥3.60 | ¥2.70 |
| Normal + PBR + 面数 | 40 | ¥4.80 | ¥3.60 |
| Normal + 多视角 + PBR | 40 | ¥4.80 | ¥3.60 |
| LowPoly | 25 | ¥3.00 | ¥2.25 |
| LowPoly + PBR | 35 | ¥4.20 | ¥3.15 |
| Geometry (白模) | 15 | ¥1.80 | ¥1.35 |
| Sketch | 25 | ¥3.00 | ¥2.25 |
| Sketch + PBR | 35 | ¥4.20 | ¥3.15 |

#### 极速版

| 场景 | 积分 | 后付费 | 资源包 |
|------|------|--------|--------|
| 图/文生3D | 15 | ¥1.80 | ¥1.35 |
| 图/文生3D + PBR | 25 | ¥3.00 | ¥2.25 |

### C. 错误码参考

| 错误码 | 说明 |
|--------|------|
| AuthFailure | 认证失败，检查密钥 |
| InvalidParameter | 参数错误 |
| ResourceNotFound | 任务不存在 |
| LimitExceeded | 超出并发限制 |
| InsufficientBalance | 余额不足 |

---

*报告生成完毕 - 2025-12-11*
