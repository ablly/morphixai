import { createClient } from '@/lib/supabase/server';

export class AdminService {
  // 检查用户是否是管理员
  static async isAdmin(userId: string): Promise<boolean> {
    const supabase = await createClient();
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    return data?.role === 'admin' || data?.role === 'super_admin';
  }

  // 获取当前登录用户并验证管理员权限
  static async requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('未登录');
    }

    const isAdmin = await this.isAdmin(user.id);
    if (!isAdmin) {
      throw new Error('无管理员权限');
    }

    return { user, supabase };
  }

  // 获取统计数据
  static async getStats() {
    const { supabase } = await this.requireAdmin();
    
    // 总用户数
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 今日新增用户
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // 总生成数
    const { count: totalGenerations } = await supabase
      .from('generations')
      .select('*', { count: 'exact', head: true });

    // 今日生成数
    const { count: todayGenerations } = await supabase
      .from('generations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // 总收入（购买类型的交易）
    const { data: purchaseData } = await supabase
      .from('credit_transactions')
      .select('amount')
      .eq('type', 'PURCHASE');
    
    const totalRevenue = purchaseData?.reduce((sum, t) => sum + t.amount, 0) || 0;

    // 今日收入
    const { data: todayPurchaseData } = await supabase
      .from('credit_transactions')
      .select('amount')
      .eq('type', 'PURCHASE')
      .gte('created_at', today.toISOString());
    
    const todayRevenue = todayPurchaseData?.reduce((sum, t) => sum + t.amount, 0) || 0;

    // 总积分消耗
    const { data: spentData } = await supabase
      .from('credit_transactions')
      .select('amount')
      .lt('amount', 0);
    
    const totalSpent = Math.abs(spentData?.reduce((sum, t) => sum + t.amount, 0) || 0);

    return {
      totalUsers: totalUsers || 0,
      todayUsers: todayUsers || 0,
      totalGenerations: totalGenerations || 0,
      todayGenerations: todayGenerations || 0,
      totalRevenue,
      todayRevenue,
      totalSpent,
    };
  }

  // 获取用户列表
  static async getUsers(page = 1, limit = 20, search?: string) {
    const { supabase } = await this.requireAdmin();
    
    let query = supabase
      .from('profiles')
      .select(`
        *,
        user_credits (balance, total_earned, total_spent)
      `, { count: 'exact' });

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return {
      users: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  // 获取单个用户详情
  static async getUserDetail(userId: string) {
    const { supabase } = await this.requireAdmin();
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_credits (balance, total_earned, total_spent)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;

    // 获取用户的生成记录
    const { data: generations } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // 获取用户的交易记录
    const { data: transactions } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      profile,
      generations: generations || [],
      transactions: transactions || [],
    };
  }

  // 更新用户积分
  static async updateUserCredits(userId: string, amount: number, reason: string) {
    const { supabase } = await this.requireAdmin();
    
    // 获取当前余额和总获得
    const { data: credits } = await supabase
      .from('user_credits')
      .select('balance, total_earned')
      .eq('user_id', userId)
      .single();

    const currentBalance = credits?.balance || 0;
    const currentTotalEarned = credits?.total_earned || 0;
    const newBalance = currentBalance + amount;

    if (newBalance < 0) {
      throw new Error('余额不能为负数');
    }

    // 更新余额
    const updateData: Record<string, unknown> = {
      balance: newBalance,
      updated_at: new Date().toISOString(),
    };
    
    // 如果是增加积分，更新 total_earned
    if (amount > 0) {
      updateData.total_earned = currentTotalEarned + amount;
    }

    await supabase
      .from('user_credits')
      .update(updateData)
      .eq('user_id', userId);

    // 记录交易
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      type: amount > 0 ? 'PURCHASE' : 'GENERATION',
      amount,
      balance_after: newBalance,
      description: `[管理员操作] ${reason}`,
    });

    return { newBalance };
  }

  // 获取生成记录列表
  static async getGenerations(page = 1, limit = 20, status?: string) {
    const { supabase } = await this.requireAdmin();
    
    let query = supabase
      .from('generations')
      .select(`
        *,
        profiles (email, full_name)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return {
      generations: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  // 获取交易记录列表
  static async getTransactions(page = 1, limit = 20, type?: string) {
    const { supabase } = await this.requireAdmin();
    
    let query = supabase
      .from('credit_transactions')
      .select(`
        *,
        profiles (email, full_name)
      `, { count: 'exact' });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return {
      transactions: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  // 获取邀请记录
  static async getReferrals(page = 1, limit = 20) {
    const { supabase } = await this.requireAdmin();
    
    const { data, count, error } = await supabase
      .from('referrals')
      .select(`
        *,
        referrer:profiles!referrals_referrer_id_fkey (email, full_name),
        referred:profiles!referrals_referred_id_fkey (email, full_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return {
      referrals: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }
}
