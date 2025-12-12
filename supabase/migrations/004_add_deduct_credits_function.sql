CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT
) RETURNS VOID AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Check balance
  SELECT balance INTO current_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Update balance
  UPDATE user_credits
  SET balance = balance - p_amount,
      total_spent = total_spent + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO credit_transactions (
    user_id,
    type,
    amount,
    balance_after,
    description
  ) VALUES (
    p_user_id,
    'GENERATION',
    -p_amount,
    current_balance - p_amount,
    p_description
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
