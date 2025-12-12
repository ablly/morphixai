-- Add Fal.ai specific fields to generations table
ALTER TABLE generations 
ADD COLUMN IF NOT EXISTS engine TEXT DEFAULT 'fal-ai',
ADD COLUMN IF NOT EXISTS is_downloaded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_license BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fal_request_id TEXT,
ADD COLUMN IF NOT EXISTS cost INTEGER DEFAULT 0;

-- Create plan_tier enum type
DO $$ BEGIN
    CREATE TYPE plan_tier AS ENUM ('free', 'starter', 'creator', 'pro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add plan_tier to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS plan_tier plan_tier DEFAULT 'free';

-- Deactivate old credit packages
UPDATE credit_packages SET is_active = false WHERE is_active = true;

-- Insert new credit packages based on PRICING_AND_STRATEGY.md
INSERT INTO credit_packages (name, credits, price_usd, is_subscription, sort_order, is_active) VALUES
  ('Starter', 1000, 9.90, false, 1, true),
  ('Creator', 3500, 29.90, false, 2, true),
  ('Pro', 12000, 99.90, false, 3, true);
