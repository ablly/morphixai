# Requirements Document

## Introduction

Morphix AI 是一个基于 AI 的 2D 转 3D 模型生成平台，与竞品 Hitem3D 竞争。本项目采用 Next.js + Supabase 技术栈，实现积分制商业模式，为用户提供从图片到 3D 模型的一站式解决方案。

### 竞品分析 (Hitem3D)
- 核心功能：Image to 3D、Multi-view to 3D、分阶段生成
- 商业模式：积分制 + 订阅制
- 目标用户：3D打印爱好者、游戏开发者、设计师
- 导出格式：GLB, OBJ, FBX, STL

### Morphix AI 差异化优势
1. **液态智能算法** - 独特的流体动力学重建技术，更有机的拓扑结构
2. **实时 WebGL 预览** - 生成过程可视化，所见即所得
3. **Linear 风格仪表盘** - 现代化资产管理体验
4. **新用户友好** - 注册即送1次免费生成体验 + 首次付费8.5折
5. **病毒式增长** - 邀请好友各得15积分 + 社交分享奖励
6. **全球化支持** - 中英文双语 + Stripe国际支付

## Glossary

- **Morphix_System**: Morphix AI 平台的核心系统
- **User**: 平台注册用户
- **Credits**: 积分，用于消费生成服务的虚拟货币
- **Generation_Task**: 一次 2D 转 3D 的生成任务
- **Model_Asset**: 生成的 3D 模型资产
- **Subscription**: 订阅套餐

## Requirements

### Requirement 1: 用户认证系统

**User Story:** As a visitor, I want to register and login to the platform, so that I can access the 3D generation features and manage my assets.

#### Acceptance Criteria

1. WHEN a visitor clicks the signup button THEN the Morphix_System SHALL display a registration form with email and password fields
2. WHEN a user submits valid registration credentials THEN the Morphix_System SHALL create a new account and grant 10 initial credits (1 free generation)
3. WHEN a user submits invalid registration data THEN the Morphix_System SHALL display specific validation error messages
4. WHEN a registered user submits correct login credentials THEN the Morphix_System SHALL authenticate the user and redirect to the dashboard
5. WHEN a user clicks logout THEN the Morphix_System SHALL terminate the session and redirect to the homepage
6. WHEN a user requests password reset THEN the Morphix_System SHALL send a reset link to the registered email

### Requirement 2: 导航栏页面系统

**User Story:** As a user, I want to navigate between different pages of the platform, so that I can access features, pricing, and information easily.

#### Acceptance Criteria

1. WHEN a user visits the Features page THEN the Morphix_System SHALL display detailed feature descriptions with visual demonstrations
2. WHEN a user visits the Pricing page THEN the Morphix_System SHALL display all available credit packages and subscription plans with clear pricing
3. WHEN a user visits the About page THEN the Morphix_System SHALL display company information, team, and mission statement
4. WHEN a user clicks navigation links THEN the Morphix_System SHALL route to the corresponding page without full page reload
5. WHEN a user is on mobile device THEN the Morphix_System SHALL display a responsive hamburger menu

### Requirement 3: 积分系统

**User Story:** As a user, I want to manage my credits, so that I can track my usage and purchase more when needed.

#### Acceptance Criteria

1. WHEN a new user completes registration THEN the Morphix_System SHALL automatically credit 10 points to the user account
2. WHEN a user initiates a generation task THEN the Morphix_System SHALL deduct 10 credits from the user balance
3. WHEN a user has insufficient credits THEN the Morphix_System SHALL block the generation and prompt to purchase credits
4. WHEN a user views their dashboard THEN the Morphix_System SHALL display current credit balance prominently
5. WHEN credits are deducted or added THEN the Morphix_System SHALL record the transaction in the credit history

### Requirement 4: 订阅与充值套餐

**User Story:** As a user, I want to purchase credits or subscribe to a plan, so that I can continue using the generation service.

#### Acceptance Criteria

1. WHEN a user selects a credit package THEN the Morphix_System SHALL display the package details and payment options
2. WHEN a user completes payment for credits THEN the Morphix_System SHALL immediately add the purchased credits to the user balance
3. WHEN a user subscribes to a monthly plan THEN the Morphix_System SHALL grant the subscription credits and set renewal date
4. WHEN a subscription renews THEN the Morphix_System SHALL automatically charge and credit the monthly allocation
5. WHEN a user cancels subscription THEN the Morphix_System SHALL stop future renewals while maintaining current period benefits

### Requirement 5: 3D 模型生成工作流

**User Story:** As a user, I want to upload images and generate 3D models, so that I can create 3D assets from my 2D references.

#### Acceptance Criteria

1. WHEN a user uploads an image THEN the Morphix_System SHALL validate the file format (JPG, PNG, WEBP) and size (max 20MB)
2. WHEN a user clicks generate with sufficient credits THEN the Morphix_System SHALL create a generation task and deduct credits
3. WHILE a generation task is processing THEN the Morphix_System SHALL display real-time progress status
4. WHEN generation completes successfully THEN the Morphix_System SHALL store the model and notify the user
5. IF generation fails THEN the Morphix_System SHALL refund the credits and display error information
6. WHEN a user views a completed model THEN the Morphix_System SHALL render it in the WebGL 3D viewer

### Requirement 6: 资产管理仪表盘

**User Story:** As a user, I want to manage my generated 3D models, so that I can organize, download, and share my assets.

#### Acceptance Criteria

1. WHEN a user visits the dashboard THEN the Morphix_System SHALL display all generated models in a grid layout
2. WHEN a user clicks on a model THEN the Morphix_System SHALL open the model detail view with 3D preview
3. WHEN a user requests download THEN the Morphix_System SHALL provide export options (GLB, OBJ, FBX)
4. WHEN a user deletes a model THEN the Morphix_System SHALL remove the model from storage and update the list
5. WHEN a user searches models THEN the Morphix_System SHALL filter the list based on name or creation date

### Requirement 7: 用户设置

**User Story:** As a user, I want to manage my account settings, so that I can update my profile and preferences.

#### Acceptance Criteria

1. WHEN a user visits settings THEN the Morphix_System SHALL display profile information and preferences
2. WHEN a user updates profile information THEN the Morphix_System SHALL save changes and confirm success
3. WHEN a user changes password THEN the Morphix_System SHALL validate and update the password securely
4. WHEN a user views billing history THEN the Morphix_System SHALL display all past transactions and subscriptions

### Requirement 8: Supabase 数据持久化

**User Story:** As a system administrator, I want data to be stored in Supabase, so that the platform has reliable and scalable data storage.

#### Acceptance Criteria

1. WHEN user data is created or updated THEN the Morphix_System SHALL persist it to Supabase database
2. WHEN credit transactions occur THEN the Morphix_System SHALL record them atomically in Supabase
3. WHEN model assets are generated THEN the Morphix_System SHALL store metadata in database and files in Supabase Storage
4. WHEN querying user data THEN the Morphix_System SHALL enforce Row Level Security policies

### Requirement 9: 国际化多语言支持

**User Story:** As a global user, I want to use the platform in my preferred language, so that I can understand all features and content.

#### Acceptance Criteria

1. WHEN a user visits any page THEN the Morphix_System SHALL display content in the user's selected language (English or Chinese)
2. WHEN a user clicks the language toggle THEN the Morphix_System SHALL switch all page content to the selected language without page reload
3. WHEN a user registers THEN the Morphix_System SHALL detect browser language and set as default preference
4. WHEN displaying pricing THEN the Morphix_System SHALL show amounts in USD with proper formatting

### Requirement 10: 邀请好友系统

**User Story:** As a user, I want to invite friends to the platform, so that both of us can earn bonus credits.

#### Acceptance Criteria

1. WHEN a user views their profile THEN the Morphix_System SHALL display a unique referral link and code
2. WHEN a new user registers using a referral link THEN the Morphix_System SHALL credit 15 points to both the referrer and referee
3. WHEN a user has invited 50 friends THEN the Morphix_System SHALL stop awarding referral credits and display limit reached message
4. WHEN viewing referral history THEN the Morphix_System SHALL display all successful referrals with dates and credits earned

### Requirement 11: 社交媒体分享奖励

**User Story:** As a user, I want to share my 3D models on social media, so that I can earn bonus credits and showcase my creations.

#### Acceptance Criteria

1. WHEN a user clicks share on a model THEN the Morphix_System SHALL display sharing options for Twitter/X, TikTok, Reddit, LinkedIn, and Facebook
2. WHEN a user shares to Twitter/X THEN the Morphix_System SHALL award 5 credits after verification
3. WHEN a user shares to TikTok THEN the Morphix_System SHALL award 5 credits after verification
4. WHEN a user shares to Reddit THEN the Morphix_System SHALL award 5 credits after verification
5. WHEN a user shares to LinkedIn THEN the Morphix_System SHALL award 5 credits after verification
6. WHEN a user shares to Facebook THEN the Morphix_System SHALL award 3 credits after verification
7. WHEN a user has earned 20 credits from sharing in one day THEN the Morphix_System SHALL stop awarding share credits until next day
8. WHEN a user attempts to share the same model to the same platform twice THEN the Morphix_System SHALL not award additional credits

### Requirement 12: 首次付费折扣

**User Story:** As a new paying user, I want to receive a discount on my first purchase, so that I can try the premium features at a lower cost.

#### Acceptance Criteria

1. WHEN a user who has never made a purchase views pricing THEN the Morphix_System SHALL display 8.5% discount badge on all packages
2. WHEN a first-time buyer proceeds to checkout THEN the Morphix_System SHALL automatically apply 15% discount to the total
3. WHEN a user completes their first purchase THEN the Morphix_System SHALL mark the discount as used and not offer it again
4. WHEN a returning customer views pricing THEN the Morphix_System SHALL display regular prices without first-purchase discount

---

## 商业模式规划 (海外版本优先 - USD/Stripe)

### 核心原则
- **海外市场优先** - 以美元定价，Stripe 支付
- **全站中英文支持** - 所有页面支持语言切换
- **营收导向** - 多种激励机制促进付费转化

### 定价策略 (美元)

#### 积分套餐 (一次性购买)
| 套餐名称 | 积分数量 | 原价 (USD) | 首次8.5折 | 单价 |
|---------|---------|-----------|----------|------|
| Starter | 20 积分 | $2.99 | **$2.54** | $0.15/积分 |
| Basic | 100 积分 | $10.99 | **$9.34** | $0.11/积分 |
| Standard | 300 积分 | $29.99 | **$25.49** | $0.10/积分 |
| Pro | 1000 积分 | $99.99 | **$84.99** | $0.10/积分 |

#### 订阅套餐 (月付)
| 套餐名称 | 月积分 | 原价 (USD) | 首次8.5折 | 特权 |
|---------|-------|-----------|----------|------|
| Pro Monthly | 200 积分/月 | $19.99/月 | **$16.99** | 优先队列、高清导出、无水印 |
| Team Monthly | 500 积分/月 | $49.99/月 | **$42.49** | 团队协作、API 访问、专属支持 |

#### 积分消耗规则
- 标准生成 (512分辨率): 10 积分/次
- 高清生成 (1024分辨率): **15 积分/次**
- 超清生成 (1536分辨率): 35 积分/次
- 多视角生成: 额外 +15 积分

### 用户增长激励体系

#### 1. 新用户激励
- 注册即送 **10 积分** (可体验1次标准生成)
- **首次付费享 8.5 折优惠** (所有套餐适用，仅限一次)

#### 2. 邀请好友计划 (Referral Program)
- 邀请人获得: **15 积分**
- 被邀请人获得: **15 积分** (注册后立即到账)
- 每位用户最多邀请 **10 人** (上限150积分)
- 唯一邀请链接: `morphix.ai/ref/{user_code}`

#### 3. 社交媒体分享奖励
| 平台 | 奖励积分 | 说明 |
|-----|---------|------|
| Twitter/X | +5 积分 | 分享生成的3D模型 |
| TikTok | +5 积分 | 分享生成的3D模型 |
| Reddit | +5 积分 | 分享生成的3D模型 |
| LinkedIn | +5 积分 | 分享生成的3D模型 |
| Facebook | +3 积分 | 分享生成的3D模型 |

- 每个模型每个平台仅限一次奖励
- 每日分享奖励上限: **20 积分**
- 分享内容自动带上 #MorphixAI 标签和链接

### Stripe 支付集成
- 支持信用卡/借记卡 (Visa, Mastercard, Amex)
- 支持 Apple Pay, Google Pay
- 支持订阅自动续费
- Webhook 处理支付回调
- 首次付费折扣通过 Stripe Coupon 实现

---

## 全新 Supabase 数据库架构设计

### 创建新项目步骤
1. 访问 https://supabase.com/dashboard
2. 点击 "New Project"
3. 项目名称: `morphix-ai`
4. 选择区域 (推荐: Singapore 或 Tokyo)
5. 设置数据库密码

### 数据库表结构

#### 1. profiles (用户资料表)
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. user_credits (用户积分账户)
```sql
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,
  balance INTEGER DEFAULT 10, -- 新用户默认10积分
  total_earned INTEGER DEFAULT 10,
  total_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. credit_packages (积分套餐)
```sql
CREATE TABLE credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  price_cny DECIMAL(10,2) NOT NULL,
  price_usd DECIMAL(10,2),
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. credit_transactions (积分交易记录)
```sql
CREATE TYPE transaction_type AS ENUM ('PURCHASE', 'CONSUME', 'REFUND', 'BONUS', 'EXPIRE');

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  related_generation_id UUID,
  related_order_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. model_generations (3D模型生成任务)
```sql
CREATE TYPE generation_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE resolution_type AS ENUM ('512', '1024', '1536');

CREATE TABLE model_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  source_image_url TEXT NOT NULL,
  resolution resolution_type DEFAULT '512',
  status generation_status DEFAULT 'PENDING',
  progress INTEGER DEFAULT 0,
  credits_consumed INTEGER NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

#### 6. model_assets (生成的3D模型资产)
```sql
CREATE TABLE model_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id UUID REFERENCES model_generations(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  thumbnail_url TEXT,
  glb_url TEXT,
  obj_url TEXT,
  fbx_url TEXT,
  vertex_count INTEGER,
  face_count INTEGER,
  file_size_bytes BIGINT,
  is_public BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 7. subscriptions (订阅记录)
```sql
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED');
CREATE TYPE subscription_plan AS ENUM ('PRO', 'TEAM');

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  plan subscription_plan NOT NULL,
  status subscription_status DEFAULT 'ACTIVE',
  monthly_credits INTEGER NOT NULL,
  price_cny DECIMAL(10,2) NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 8. orders (订单表)
```sql
CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  package_id UUID REFERENCES credit_packages(id),
  subscription_id UUID REFERENCES subscriptions(id),
  amount_usd DECIMAL(10,2) NOT NULL,
  discount_applied DECIMAL(10,2) DEFAULT 0, -- 首次8.5折优惠金额
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status order_status DEFAULT 'PENDING',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 9. referrals (邀请好友记录)
```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id) NOT NULL, -- 邀请人
  referee_id UUID REFERENCES profiles(id) NOT NULL,  -- 被邀请人
  referrer_credits_awarded INTEGER DEFAULT 15,
  referee_credits_awarded INTEGER DEFAULT 15,
  referral_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户邀请码
ALTER TABLE profiles ADD COLUMN referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN referred_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN first_purchase_discount_used BOOLEAN DEFAULT FALSE;
```

#### 10. social_shares (社交分享记录)
```sql
CREATE TYPE social_platform AS ENUM ('TWITTER', 'TIKTOK', 'REDDIT', 'LINKEDIN', 'FACEBOOK');

CREATE TABLE social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  model_id UUID REFERENCES model_assets(id) NOT NULL,
  platform social_platform NOT NULL,
  credits_awarded INTEGER NOT NULL,
  share_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, model_id, platform) -- 每个模型每个平台只能分享一次
);
```

#### 11. daily_share_limits (每日分享限制)
```sql
CREATE TABLE daily_share_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  credits_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);
```

### Row Level Security (RLS) 策略
```sql
-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_assets ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own credits" ON user_credits FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own generations" ON model_generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create generations" ON model_generations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own assets" ON model_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public assets are viewable" ON model_assets FOR SELECT USING (is_public = true);
```

### Storage Buckets
```sql
-- 创建存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('source-images', 'source-images', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('model-assets', 'model-assets', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);
```

### 触发器: 新用户自动创建积分账户
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO user_credits (user_id, balance, total_earned)
  VALUES (NEW.id, 10, 10); -- 新用户赠送10积分
  
  INSERT INTO credit_transactions (user_id, type, amount, balance_before, balance_after, description)
  VALUES (NEW.id, 'BONUS', 10, 0, 10, '新用户注册奖励');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Morphix AI 差异化文案

### 核心卖点

**1. 液态智能 (Liquid Intelligence)**
> "我们的 AI 不只是扫描，它在流动。利用先进的流体动力学算法，以有机的精度重构 3D 拓扑结构。"

**2. 原子级精度 (Atomic Precision)**
> "每一个顶点都经过优化，每一条 UV 都精心展开。从像素到多边形，精确到原子级别。"

**3. 所见即所得 (Real-time Preview)**
> "实时 WebGL 预览，生成过程可视化。不再盲等，创作过程尽在掌控。"

### 对比竞品优势

| 特性 | Morphix AI | Hitem3D |
|-----|-----------|---------|
| 新用户体验 | ✅ 注册送1次免费生成 | ❌ 需付费 |
| 首次付费优惠 | ✅ 8.5折优惠 | ❌ 无 |
| 邀请奖励 | ✅ 双方各得15积分 | ❌ 无 |
| 社交分享奖励 | ✅ 分享得积分 | ❌ 无 |
| 实时预览 | ✅ WebGL 实时渲染 | ❌ 仅结果预览 |
| 多语言支持 | ✅ 中英文双语 | 部分支持 |
| 资产管理 | Linear 风格仪表盘 | 传统列表 |
| 支付方式 | Stripe (全球) | 仅国际支付 |


---

## 页面结构规划

### 导航栏页面

| 页面 | 路由 | 功能描述 |
|-----|------|---------|
| 首页 | `/` | 产品介绍、Hero区、功能展示、定价预览 |
| 功能 | `/features` | 详细功能介绍、技术规格、使用场景 |
| 定价 | `/pricing` | 积分套餐、订阅方案、FAQ |
| 关于 | `/about` | 公司介绍、团队、联系方式 |
| 登录 | `/login` | 邮箱登录、第三方登录 |
| 注册 | `/signup` | 新用户注册 |
| 仪表盘 | `/dashboard` | 用户资产管理、生成历史 |
| 创建 | `/create` | 上传图片、生成3D模型 |
| 设置 | `/settings` | 账户设置、订阅管理 |

### 核心用户流程

```
访客 → 首页 → 注册 → 获得10积分 → 创建页上传图片 → 生成3D模型 → 仪表盘查看/下载
                                    ↓
                              积分不足 → 定价页 → 购买积分/订阅 → 继续生成
```

---

## 技术栈确认

- **前端框架**: Next.js 15 (App Router)
- **UI 组件**: Radix UI + Tailwind CSS
- **3D 渲染**: React Three Fiber + Three.js
- **动画**: Framer Motion + GSAP
- **国际化**: next-intl (中/英双语，所有页面)
- **后端**: Supabase (Auth + Database + Storage)
- **支付**: Stripe (USD，支持全球信用卡/Apple Pay/Google Pay)
- **社交分享**: Twitter/X API, LinkedIn API, Facebook SDK

---

## 下一步行动

1. **创建新 Supabase 项目** - 在 Dashboard 中创建 `morphix-ai` 项目
2. **执行数据库迁移** - 运行上述 SQL 创建表结构
3. **配置环境变量** - 获取新项目的 URL 和 API Key
4. **开发导航页面** - Features、Pricing、About 页面
5. **实现认证系统** - 登录/注册功能
6. **开发核心功能** - 3D 生成工作流
