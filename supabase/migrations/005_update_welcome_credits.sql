-- 更新新用户注册触发器：将初始积分从10改为5
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_referral_code TEXT;
BEGIN
  -- 生成唯一邀请码
  LOOP
    new_referral_code := generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE referral_code = new_referral_code);
  END LOOP;

  -- 创建用户资料
  INSERT INTO profiles (id, email, referral_code)
  VALUES (NEW.id, NEW.email, new_referral_code);

  -- 创建积分账户 (初始5积分)
  INSERT INTO user_credits (user_id, balance, total_earned)
  VALUES (NEW.id, 5, 5);

  -- 记录欢迎积分交易
  INSERT INTO credit_transactions (user_id, type, amount, balance_after, description)
  VALUES (NEW.id, 'WELCOME', 5, 5, 'Welcome bonus credits');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
