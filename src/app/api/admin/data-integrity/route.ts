import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

/**
 * 数据完整性检查 API
 * 用于验证数据库数据的一致性
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();
    
    // 验证管理员权限
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 检查是否是管理员
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const issues: string[] = [];
    const stats: Record<string, any> = {};

    // 1. 检查用户积分一致性
    const { data: creditsData } = await adminSupabase
      .from('user_credits')
      .select('user_id, balance, total_earned, total_spent');

    if (creditsData) {
      for (const credit of creditsData) {
        // 计算交易记录中的实际余额
        const { data: transactions } = await adminSupabase
          .from('credit_transactions')
          .select('amount')
          .eq('user_id', credit.user_id);

        if (transactions) {
          const calculatedBalance = transactions.reduce((sum, t) => sum + t.amount, 0);
          
          // 允许小误差 (由于并发操作)
          if (Math.abs(calculatedBalance - credit.balance) > 1) {
            issues.push(`User ${credit.user_id}: Balance mismatch. Stored: ${credit.balance}, Calculated: ${calculatedBalance}`);
          }
        }
      }
      stats.totalUsers = creditsData.length;
    }

    // 2. 检查生成记录状态
    const { data: generations } = await adminSupabase
      .from('generations')
      .select('id, status, created_at, completed_at, credits_used, user_id')
      .order('created_at', { ascending: false })
      .limit(100);

    if (generations) {
      const stuckGenerations = generations.filter(g => {
        if (g.status === 'PROCESSING') {
          const createdAt = new Date(g.created_at);
          const now = new Date();
          const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
          return hoursDiff > 1; // 超过1小时仍在处理中
        }
        return false;
      });

      if (stuckGenerations.length > 0) {
        issues.push(`Found ${stuckGenerations.length} stuck generations (PROCESSING > 1 hour)`);
        stats.stuckGenerations = stuckGenerations.map(g => ({
          id: g.id,
          createdAt: g.created_at,
          userId: g.user_id,
        }));
      }

      stats.recentGenerations = {
        total: generations.length,
        completed: generations.filter(g => g.status === 'COMPLETED').length,
        failed: generations.filter(g => g.status === 'FAILED').length,
        processing: generations.filter(g => g.status === 'PROCESSING').length,
      };
    }

    // 3. 检查孤立的用户记录 (有 auth.users 但没有 profiles)
    // 这需要 service role 权限
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id');

    const { data: userCredits } = await adminSupabase
      .from('user_credits')
      .select('user_id');

    if (profiles && userCredits) {
      const profileIds = new Set(profiles.map(p => p.id));
      const creditUserIds = new Set(userCredits.map(c => c.user_id));

      // 检查有 profile 但没有 credits 的用户
      const missingCredits = profiles.filter(p => !creditUserIds.has(p.id));
      if (missingCredits.length > 0) {
        issues.push(`Found ${missingCredits.length} users without credit records`);
        stats.missingCredits = missingCredits.map(p => p.id);
      }
    }

    // 4. 检查邀请记录一致性
    const { data: referrals } = await adminSupabase
      .from('referrals')
      .select('referrer_id, referred_id, credits_awarded');

    if (referrals) {
      stats.totalReferrals = referrals.length;
      stats.totalReferralCredits = referrals.reduce((sum, r) => sum + r.credits_awarded, 0);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      issues,
      hasIssues: issues.length > 0,
      stats,
    });
  } catch (error: any) {
    console.error('Data integrity check error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * 修复数据完整性问题
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();
    
    // 验证管理员权限
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, userId, generationId } = body;

    const results: string[] = [];

    switch (action) {
      case 'fix_stuck_generation': {
        // 修复卡住的生成任务
        if (!generationId) {
          return NextResponse.json({ error: 'generationId required' }, { status: 400 });
        }

        const { data: generation } = await adminSupabase
          .from('generations')
          .select('*')
          .eq('id', generationId)
          .single();

        if (generation && generation.status === 'PROCESSING') {
          // 标记为失败并退款
          await adminSupabase
            .from('generations')
            .update({
              status: 'FAILED',
              error_message: 'Manually marked as failed due to timeout',
              completed_at: new Date().toISOString(),
            })
            .eq('id', generationId);

          // 退款
          const { data: currentCredits } = await adminSupabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', generation.user_id)
            .single();

          if (currentCredits) {
            const newBalance = currentCredits.balance + generation.credits_used;
            await adminSupabase
              .from('user_credits')
              .update({ balance: newBalance })
              .eq('user_id', generation.user_id);

            await adminSupabase.from('credit_transactions').insert({
              user_id: generation.user_id,
              type: 'REFUND',
              amount: generation.credits_used,
              balance_after: newBalance,
              description: 'Refund for stuck generation (admin fix)',
              reference_id: generationId,
            });

            results.push(`Refunded ${generation.credits_used} credits to user ${generation.user_id}`);
          }

          results.push(`Marked generation ${generationId} as FAILED`);
        }
        break;
      }

      case 'create_missing_credits': {
        // 为缺少积分记录的用户创建记录
        const { data: profiles } = await adminSupabase
          .from('profiles')
          .select('id');

        const { data: existingCredits } = await adminSupabase
          .from('user_credits')
          .select('user_id');

        if (profiles && existingCredits) {
          const existingUserIds = new Set(existingCredits.map(c => c.user_id));
          const missingUsers = profiles.filter(p => !existingUserIds.has(p.id));

          for (const user of missingUsers) {
            await adminSupabase.from('user_credits').insert({
              user_id: user.id,
              balance: 10,
              total_earned: 10,
              total_spent: 0,
            });

            await adminSupabase.from('credit_transactions').insert({
              user_id: user.id,
              type: 'WELCOME',
              amount: 10,
              balance_after: 10,
              description: 'Welcome bonus credits (admin fix)',
            });

            results.push(`Created credit record for user ${user.id}`);
          }
        }
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('Data fix error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
