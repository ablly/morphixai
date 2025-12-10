# Implementation Plan - Morphix AI Platform

## Phase 1: 项目基础设施

- 
  - [x] 1.2 执行数据库迁移脚本 ✅
    - 创建所有数据表 (profiles, user_credits, credit_packages 等)
    - 创建枚举类型 (transaction_type, generation_status 等)
    - 设置 RLS 策略
    - 创建新用户触发器
    - _Requirements: 8.1, 8.4_

  - [ ] 1.3 配置 Supabase Storage 存储桶
    - 创建 source-images, model-assets, thumbnails 存储桶
    - 配置存储访问策略
    - _Requirements: 8.3_

- [x] 2. 配置 Stripe 支付集成 ✅
  - [ ] 2.1 创建 Stripe 账户并获取 API 密钥 (需用户手动配置)
  - [x] 2.2 Stripe 服务代码已实现 (`lib/stripe/service.ts`)

- [x] 3. 安装项目依赖 ✅

## Phase 2: 认证系统

- [x] 4. 实现 Supabase Auth 集成 ✅
  - [x] 4.1 创建 Supabase 客户端工具 ✅
  - [x] 4.2 实现注册功能 ✅
  - [ ] 4.3 编写属性测试: 新用户积分初始化
  - [x] 4.4 实现登录功能 ✅
  - [x] 4.5 实现登出功能 ✅
  - [x] 4.6 实现密码重置 ✅ (新增)

## Phase 3: 积分系统

- [x] 5. 实现积分服务 ✅
  - [x] 5.1 创建积分服务模块 (`lib/credits/service.ts`) ✅
  - [ ] 5.2 编写属性测试: 积分扣除一致性
  - [ ] 5.3 编写属性测试: 积分不足阻止
  - [ ] 5.4 编写属性测试: 交易日志完整性

- [ ] 6. Checkpoint - 确保所有测试通过

## Phase 4: 导航页面 (中英文)

- [x] 7. 更新国际化配置 ✅
  - [x] 7.1 扩展 messages/en.json 和 messages/zh.json ✅
  - [ ] 7.2 编写属性测试: 语言内容一致性

- [x] 8. 实现 Features 页面 ✅
  - [x] 8.1 创建 `app/[locale]/features/page.tsx` ✅

- [x] 9. 实现 Pricing 页面 ✅
  - [x] 9.1 创建 `app/[locale]/pricing/page.tsx` ✅ (已添加购买功能)
  - [ ] 9.2 编写属性测试: 首次购买折扣显示

- [x] 10. 实现 About 页面 ✅
  - [x] 10.1 创建 `app/[locale]/about/page.tsx` ✅

- [x] 11. 更新导航组件 ✅
  - [x] 11.1 更新 `components/FixedUI.tsx` ✅

## Phase 5: 支付系统

- [x] 12. 实现 Stripe 支付流程 ✅
  - [x] 12.1 创建支付服务模块 (`lib/stripe/service.ts`) ✅
  - [x] 12.2 创建 Stripe Webhook 处理 (`api/webhooks/stripe/route.ts`) ✅
  - [x] 12.3 创建 Checkout API (`api/checkout/route.ts`) ✅
  - [ ] 12.4 编写属性测试: 首次购买折扣单次使用

- [ ] 13. 实现订阅管理
  - [x] 13.1 订阅服务代码已实现 ✅


## Phase 6: 3D 生成工作流

- [x] 14. 实现文件上传 ✅
  - [x] 14.1 创建上传服务 (集成在 `api/generate/route.ts`) ✅
  - [ ] 14.2 编写属性测试: 文件验证正确性

- [x] 15. 实现生成服务 ✅
  - [x] 15.1 创建生成服务模块 (`api/generate/route.ts`) ✅
  - [x] 15.2 实现生成失败退款 ✅
  - [ ] 15.3 编写属性测试: 生成失败退款

- [x] 16. 实现创建页面 ✅
  - [x] 16.1 创建 `app/[locale]/create/page.tsx` ✅ (完整API集成)

- [ ] 17. Checkpoint - 确保所有测试通过

## Phase 7: 资产管理仪表盘

- [x] 18. 实现资产服务 ✅
  - [x] 18.1 资产管理集成在 Dashboard 页面 ✅

- [x] 19. 实现仪表盘页面 ✅
  - [x] 19.1 创建 `app/[locale]/dashboard/page.tsx` ✅
  - [x] 19.2 实现下载和删除功能 ✅
  - [x] 19.3 实现实时状态更新 (Supabase Realtime) ✅

## Phase 8: 邀请系统

- [x] 20. 实现邀请服务 ✅
  - [x] 20.1 创建邀请服务模块 (`lib/referral/service.ts`) ✅
  - [ ] 20.2 编写属性测试: 唯一邀请码生成
  - [ ] 20.3 编写属性测试: 邀请积分分配
  - [ ] 20.4 编写属性测试: 邀请限制执行

- [x] 21. 实现邀请页面 ✅
  - [x] 21.1 创建 `app/[locale]/ref/[code]/page.tsx` ✅
  - [x] 21.2 在设置页面添加邀请面板 (`components/settings/ReferralTab.tsx`) ✅

## Phase 9: 社交分享系统

- [x] 22. 实现社交分享服务 ✅
  - [x] 22.1 创建社交分享服务模块 (`lib/social/service.ts`) ✅
  - [ ] 22.2 编写属性测试: 社交分享奖励
  - [ ] 22.3 编写属性测试: 每日分享限制
  - [ ] 22.4 编写属性测试: 重复分享防止

- [x] 23. 实现分享 UI 组件 ✅
  - [x] 23.1 创建分享对话框组件 (`components/ShareDialog.tsx`) ✅

## Phase 10: 用户设置

- [x] 24. 实现设置页面 ✅
  - [x] 24.1 创建 `app/[locale]/settings/page.tsx` ✅

## Phase 11: 首页优化

- [x] 25. 更新首页内容 ✅
  - [x] 25.1 更新 `components/LandingOverlay.tsx` ✅ (免费积分推广区域)
  - [x] 25.2 更新 3D 展示效果 ✅ (Hero3D 粒子动画)

## Phase 12: 最终测试和优化

- [ ] 26. Final Checkpoint - 确保所有测试通过

- [x] 27. 性能优化 ✅
  - [x] 27.1 实现代码分割和懒加载 ✅ (dynamic import for Viewer3D)
  - [x] 27.2 优化图片和 3D 资源加载 ✅ (LazyImage 组件)
  - [x] 27.3 添加 loading 状态和骨架屏 ✅ (Skeleton 组件)

- [x] 28. SEO 优化 ✅
  - [x] 28.1 添加 metadata 和 Open Graph 标签 ✅
  - [x] 28.2 创建 sitemap.xml ✅
  - [x] 28.3 创建 robots.txt ✅

---

## 📊 进度总结

### 已完成 ✅
- 数据库迁移脚本
- Supabase 客户端配置
- 认证系统 (登录/注册/登出/密码重置/修改密码)
- 积分服务 (扣除/添加/退款/交易历史)
- 国际化配置 (中英文完整)
- 所有导航页面 (Features, Pricing, About)
- 导航组件 (响应式)
- Stripe 支付服务和 Webhook
- 创建页面 (完整API集成)
- 仪表盘页面 (实时更新、下载、删除、分享)
- 邀请系统服务和页面
- 社交分享服务和UI组件 (5个平台)
- 设置页面 (账户/账单/邀请)
- 3D 生成 API (`api/generate/route.ts`)
- 用户 API (积分/交易/资料)
- 健康检查 API
- Middleware 路由保护
- SEO 优化 (metadata, Open Graph, sitemap, robots)
- 404 错误页面
- Toast 通知组件

### 待完成 ⏳ (用户手动配置)
- Stripe 账户配置 (需用户手动配置 API Keys)
- Tripo3D API Key 配置
- Supabase 项目创建和配置

## Phase 13: Tripo3D API 集成 (2024-12-10) ✅

### 选择 Tripo3D 的原因
- ✅ 成本更低 (~$0.16-0.27/次 vs Meshy ~$0.36-0.60/次)
- ✅ 利润率更高 (80-95% vs 40-64%)
- ✅ 生成速度快 (~1-2分钟)
- ✅ 完整纹理支持 (不像 Replicate 上的 Hunyuan3D 只有白模)
- ✅ API 简单易用
- ✅ 支持 PBR 材质

### 已完成
- [x] 创建 Tripo3D 服务模块 (`lib/tripo3d/service.ts`)
- [x] 更新积分消耗配置 (`lib/credits/service.ts`)
- [x] 更新环境变量示例 (`.env.local.example`)

### 新积分定价方案

```
┌─────────────────────────────────────────────────────────────┐
│                    MORPHIX AI 积分消耗表                      │
├─────────────────────────────────────────────────────────────┤
│ 【基础生成】                                                  │
│   文字转3D .......................... 10 积分                │
│   单图转3D (Standard 512px) ......... 10 积分                │
│   单图转3D (High 1024px) ............ 15 积分                │
│   单图转3D (Ultra 2048px) ........... 25 积分                │
│   多视角转3D (2-6张图) .............. 15 积分                │
│   涂鸦转3D .......................... 10 积分                │
├─────────────────────────────────────────────────────────────┤
│ 【高级选项】(可叠加)                                          │
│   高清纹理 (HD Texture) ............. +5 积分                │
│   PBR材质 (金属/粗糙/法线) .......... +3 积分                │
│   骨骼绑定 (Rigging) ................ +10 积分               │
│   智能低多边形 (Low-poly) ........... +3 积分                │
│   部件分割 .......................... +5 积分                │
├─────────────────────────────────────────────────────────────┤
│ 【输出格式】(免费)                                            │
│   GLB / FBX / OBJ / USD / STL                               │
└─────────────────────────────────────────────────────────────┘
```

### 利润分析 (使用 Tripo3D Advanced $39.9/月 = 8000积分)

| 功能 | 你的积分 | Tripo成本 | 用户付费(Basic) | 利润率 |
|------|---------|----------|----------------|--------|
| Standard | 10 | $0.16 | $1.50 | **89%** |
| High | 15 | $0.21 | $2.25 | **91%** |
| Ultra | 25 | $0.27 | $3.75 | **93%** |
| 多视角 | 15 | $0.27 | $2.25 | **88%** |

### 待完成
- [x] 更新 `/api/generate` 路由调用 Tripo3D API ✅
- [x] 更新 Create 页面 UI (添加新功能选项) ✅
- [ ] 添加 Webhook 处理生成完成回调
- [ ] 测试完整生成流程
- [ ] 用户需要配置 TRIPO3D_API_KEY

### 已完成功能 (2024-12-10)
- `/api/generate` 路由已支持:
  - 4种生成模式: IMAGE_TO_3D, TEXT_TO_3D, MULTI_VIEW, DOODLE
  - 5种高级选项: HD_TEXTURE, PBR_MATERIAL, RIGGING, LOW_POLY, PART_SEGMENT
  - 5种输出格式: GLB, OBJ, FBX, USDZ, STL
  - 动态积分计算
  - 自动回退到模拟模式 (当未配置 API Key 时)
- Create 页面 UI 已更新:
  - 生成模式选择器 (4种模式)
  - 多视角图片上传 (2-6张)
  - 高级选项复选框 (5个选项)
  - 动态积分消耗显示
  - 积分明细分解

## 🎉 项目完成状态

### 核心功能已全部完成 ✅
- Tripo3D API 集成 (主要 3D 生成服务)
- 4种生成模式: 单图/文字/多视角/涂鸦
- 5种高级选项: HD纹理/PBR材质/骨骼绑定/低多边形/部件分割
- 5种输出格式: GLB/OBJ/FBX/USDZ/STL
- 完整的积分系统和支付流程
- 用户认证和账户管理
- 邀请和社交分享奖励系统

### 部署前需要配置
1. **Supabase**: 创建项目，配置环境变量
2. **Stripe**: 创建账户，配置 API Keys 和 Webhook
3. **Tripo3D**: 获取 API Key (https://platform.tripo3d.ai)
4. **Resend**: 配置邮件服务 (可选)

### 积分消耗调整建议

| 功能 | 积分消耗 | 说明 |
|------|---------|------|
| 单图转3D (Standard) | 10 | 基础生成 |
| 单图转3D (High) | 15 | 高清生成 |
| 单图转3D (Ultra) | 35 | 超清生成 |
| 多视角转3D | 20 | 更精确的几何 |
| 纹理生成 (已有模型) | 8 | 仅生成纹理 |
| PBR材质生成 | 12 | 包含金属度/粗糙度/法线 |
| Turbo模式 | -30% | 速度快但质量略低 |
| 纹理增强 | +5 | 后处理增强 |

### 部署方案选择

**方案A: 自托管 GPU 服务器 (推荐)**
- 优点: 成本可控，无API限制
- 缺点: 需要运维
- 推荐: AWS/GCP GPU 实例 (A10G/T4)
- 成本: ~$0.5-1/小时

**方案B: Replicate/RunPod 托管**
- 优点: 无需运维，按需付费
- 缺点: 成本略高
- 成本: ~$0.05-0.10/次

**方案C: 腾讯云混元API (如果开放)**
- 优点: 官方支持，稳定
- 缺点: 可能有调用限制
- 状态: 待确认API可用性

### 已通过 MCP 完成 ✅
- Supabase 数据库表和迁移
- Storage 存储桶 (generations - 200MB)
- 存储策略 (RLS)
- 函数安全修复 (search_path)
- TypeScript 类型生成

### 最新修复 (2024-12-09) ✅
- 修复所有页面缺少 locale 前缀的链接问题
  - login/signup 页面的跳转链接
  - features/about/pricing 页面的返回按钮
- 集成 ToastProvider 到 layout.tsx
- 修复 AccountTab 未使用变量警告
- 修复 About 页面 TypeScript 类型错误
- 添加 Pricing 页面订阅按钮功能
- 添加 Dashboard 页面支付成功提示
- 更新 .env.local.example 添加 Resend 配置
- 移除未使用的导入 (Zap, Crown)

### 性能优化 (2024-12-09) ✅
- 创建 Rate Limiting 工具 (`lib/rate-limit.ts`)
- 创建确认对话框组件 (`components/ui/confirm-dialog.tsx`)
- 创建骨架屏组件 (`components/ui/skeleton.tsx`)
- 创建懒加载图片组件 (`components/ui/lazy-image.tsx`)
- 创建键盘快捷键 Hook (`hooks/useKeyboardShortcuts.ts`)
- 更新 Dashboard 页面集成新组件:
  - 使用 DashboardSkeleton 替代简单 loading
  - 使用 LazyImage 实现图片懒加载
  - 使用 useConfirm 替代原生 confirm 对话框
  - 添加键盘快捷键 (Ctrl+N 新建, Alt+H 首页, Ctrl+, 设置, Ctrl+K 搜索)
- 为 API 路由添加 Rate Limiting:
  - `/api/generate` - 每分钟10次
  - `/api/checkout` - 每分钟5次
  - `/api/social/share` - 每分钟20次

### OAuth 配置 (2024-12-09) ✅
- GitHub OAuth 配置完成
- Google OAuth 配置完成
- 创建 `[locale]/auth/callback` 路由处理 OAuth 回调
- 更新登录/注册页面的 redirectTo 配置
- OAuth 凭据保存在 `.credentials/oauth-secrets.md`

### 代码清理 (2024-12-09) ✅
- 修复 metadataBase 警告
- 移除未使用的导入 (User, useRef, AnimatePresence, RotateCw)

### 免费积分推广优化 (2024-12-09) ✅
- 首页添加免费积分展示区 (`LandingOverlay.tsx`)
  - 邀请好友: +5 积分/人 (最多10人，上限50积分)
  - 分享作品: +3~5 积分/次 (每日上限20积分)
  - 注册奖励: 10 积分
- 定价页面底部添加免费积分推广横幅
  - 展示邀请和分享奖励
  - 快捷入口到注册和邀请码页面
- Dashboard 添加浮动"免费积分"按钮
  - 点击展开弹窗显示获取方式
  - 快捷跳转到邀请码设置页面
- 定价策略优化:
  - Starter: $4.99 → 20积分 ($0.25/积分)
  - Basic: $14.99 → 100积分 ($0.15/积分, 省40%)
  - Standard: $29.99 → 300积分 ($0.10/积分, 省60%) - 最受欢迎
  - Pro: $79.99 → 1000积分 ($0.08/积分, 省68%) - 超值之选

### 用户体验优化 (2024-12-09) ✅
- 注册页面欢迎奖励提示更明确显示"10积分"
- Create 页面积分不足时显示快捷购买/免费获取入口
- 修复 Demo 页面未使用的 useState 问题
- 修复 Features 页面动态 Tailwind 类名问题
- 移除未使用的导入 (Sparkles, Cpu, Share2)

### 功能完善 (2024-12-09) ✅
1. **邀请成功邮件通知**
   - 创建 `referral-reward.tsx` 邮件模板
   - 更新 `ReferralService.processReferral()` 发送邮件通知
   - 邀请人收到邮件显示获得积分和当前余额

2. **Dashboard 筛选/排序功能**
   - 添加状态筛选 (全部/已完成/处理中/失败/等待中)
   - 添加排序选项 (最新优先/最早优先)
   - 筛选和排序可组合使用

3. **账户删除 API**
   - 创建 `/api/user/delete` DELETE 接口
   - 需要输入邮箱确认才能删除
   - 按依赖顺序删除所有用户数据
   - 更新 AccountTab 添加删除确认 UI

4. **生成进度详细反馈**
   - 添加进度条组件显示百分比
   - 7个阶段的详细进度提示
   - 实时更新日志和进度状态

### 补充完善 (2024-12-09) ✅
1. **SEO 文件**
   - 创建 `public/robots.txt`
   - 创建 `src/app/sitemap.ts` 动态生成站点地图

2. **错误处理**
   - 创建 `[locale]/loading.tsx` 全局加载状态
   - 创建 `[locale]/error.tsx` 页面错误边界
   - 创建 `global-error.tsx` 全局错误边界

3. **个人资料设置**
   - 创建 `ProfileTab.tsx` 组件
   - 支持修改显示名称和简介
   - 头像上传 UI（功能待完善）
   - 更新 SettingsSidebar 添加 Profile 标签
