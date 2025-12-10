import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 获取用户积分信息
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // 如果没有积分记录，创建一个
      if (error.code === 'PGRST116') {
        const { data: newCredits, error: createError } = await supabase
          .from('user_credits')
          .insert({ user_id: user.id, balance: 10, total_earned: 10 })
          .select()
          .single();
        
        if (createError) {
          return NextResponse.json({ error: createError.message }, { status: 500 });
        }
        return NextResponse.json(newCredits);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(credits);
  } catch (error: any) {
    console.error('Get credits error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
