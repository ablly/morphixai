-- Morphix AI 数据库迁移 002
-- 添加生成任务的额外字段和性能优化

-- ═══════════════════════════════════════════════════════════════
-- 1. 生成任务表新字段
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE generations 
ADD COLUMN IF NOT EXISTS tripo_task_id TEXT;

ALTER TABLE generations 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

ALTER TABLE generations 
ADD COLUMN IF NOT EXISTS processing_time_ms INTEGER;

ALTER TABLE generations 
ADD COLUMN IF NOT EXISTS metadata JSONB;

ALTER TABLE generations 
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'IMAGE_TO_3D';

ALTER TABLE generations 
ADD COLUMN IF NOT EXISTS output_format TEXT DEFAULT 'glb';

-- ═══════════════════════════════════════════════════════════════
-- 2. 用户配额表
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  daily_generations INTEGER DEFAULT 0,
  daily_reset_at TIMESTAMPTZ DEFAULT NOW(),
  monthly_generations INTEGER DEFAULT 0,
  monthly_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- 3. API 日志表
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;
-- 不创建策略，只允许 service_role 访问

-- ═══════════════════════════════════════════════════════════════
-- 4. 索引优化
-- ═══════════════════════════════════════════════════════════════

-- 生成任务索引
CREATE INDEX IF NOT EXISTS idx_generations_tripo_task_id ON generations(tripo_task_id);
CREATE INDEX IF NOT EXISTS idx_generations_mode ON generations(mode);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);

-- API 日志索引
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at DESC);

-- 外键索引 (性能优化)
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_generation_id ON social_shares(generation_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_package_id ON subscriptions(package_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- ═══════════════════════════════════════════════════════════════
-- 5. RLS 策略优化 (使用 select 包装提升性能)
-- ═══════════════════════════════════════════════════════════════

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING ((select auth.uid()) = id);

-- user_credits
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING ((select auth.uid()) = user_id);

-- credit_transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING ((select auth.uid()) = user_id);

-- generations
DROP POLICY IF EXISTS "Users can view own generations" ON generations;
CREATE POLICY "Users can view own generations" ON generations
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own generations" ON generations;
CREATE POLICY "Users can insert own generations" ON generations
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own generations" ON generations;
CREATE POLICY "Users can update own generations" ON generations
  FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own generations" ON generations;
CREATE POLICY "Users can delete own generations" ON generations
  FOR DELETE USING ((select auth.uid()) = user_id);

-- referrals
DROP POLICY IF EXISTS "Users can view referrals they made" ON referrals;
CREATE POLICY "Users can view referrals they made" ON referrals
  FOR SELECT USING ((select auth.uid()) = referrer_id);

-- social_shares
DROP POLICY IF EXISTS "Users can view own shares" ON social_shares;
CREATE POLICY "Users can view own shares" ON social_shares
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own shares" ON social_shares;
CREATE POLICY "Users can insert own shares" ON social_shares
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING ((select auth.uid()) = user_id);

-- user_quotas
DROP POLICY IF EXISTS "Users can view own quotas" ON user_quotas;
CREATE POLICY "Users can view own quotas" ON user_quotas
  FOR SELECT USING ((select auth.uid()) = user_id);

-- ═══════════════════════════════════════════════════════════════
-- 6. 触发器
-- ═══════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS update_user_quotas_updated_at ON user_quotas;
CREATE TRIGGER update_user_quotas_updated_at
  BEFORE UPDATE ON user_quotas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
