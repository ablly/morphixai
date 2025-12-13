'use client';

import { useEffect, useState } from 'react';
import { Users, Image, CreditCard, TrendingUp, Loader2, RefreshCw, Clock, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  todayUsers: number;
  totalGenerations: number;
  todayGenerations: number;
  totalRevenue: number;
  todayRevenue: number;
  totalSpent: number;
  completedGenerations: number;
  failedGenerations: number;
  pendingGenerations: number;
}



export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchAllData();
    // 每30秒自动刷新
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [statsRes, usersRes, txRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users?limit=5'),
        fetch('/api/admin/transactions?limit=5'),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setRecentUsers(data.users || []);
      }
      if (txRes.ok) {
        const data = await txRes.json();
        setRecentTransactions(data.transactions || []);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: '总用户数',
      value: stats?.totalUsers || 0,
      subValue: `今日新增 +${stats?.todayUsers || 0}`,
      icon: Users,
      color: 'cyan',
      href: '/zh/admin/users',
    },
    {
      title: '总生成数',
      value: stats?.totalGenerations || 0,
      subValue: `今日 +${stats?.todayGenerations || 0}`,
      icon: Image,
      color: 'purple',
      href: '/zh/admin/generations',
    },
    {
      title: '积分购买总额',
      value: stats?.totalRevenue || 0,
      subValue: `今日 +${stats?.todayRevenue || 0}`,
      icon: CreditCard,
      color: 'green',
      href: '/zh/admin/transactions',
    },
    {
      title: '积分消耗总额',
      value: stats?.totalSpent || 0,
      subValue: '用户已使用',
      icon: TrendingUp,
      color: 'orange',
      href: '/zh/admin/transactions',
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; ring: string }> = {
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', ring: 'ring-cyan-500/30' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', ring: 'ring-purple-500/30' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', ring: 'ring-green-500/30' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', ring: 'ring-orange-500/30' },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">管理仪表盘</h1>
          {lastUpdated && (
            <p className="text-sm text-zinc-500 mt-1">
              最后更新: {lastUpdated.toLocaleTimeString('zh-CN')}
            </p>
          )}
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="border-white/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          刷新数据
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const colors = colorClasses[card.color];
          return (
            <Link key={card.title} href={card.href}>
              <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colors.bg} ring-1 ${colors.ring}`}>
                    <card.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                </div>
                <h3 className="text-zinc-400 text-sm">{card.title}</h3>
                <p className="text-3xl font-bold text-white mt-1">{card.value.toLocaleString()}</p>
                <p className="text-sm text-zinc-500 mt-2">{card.subValue}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 生成状态统计 */}
      <div className="mt-8 bg-zinc-900/50 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          生成状态分布
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="text-2xl font-bold text-green-400">{stats?.completedGenerations || 0}</p>
            <p className="text-sm text-zinc-400">已完成</p>
          </div>
          <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <p className="text-2xl font-bold text-yellow-400">{stats?.pendingGenerations || 0}</p>
            <p className="text-sm text-zinc-400">处理中</p>
          </div>
          <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <p className="text-2xl font-bold text-red-400">{stats?.failedGenerations || 0}</p>
            <p className="text-sm text-zinc-400">失败</p>
          </div>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最新用户 */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              最新注册用户
            </h2>
            <Link href="/zh/admin/users" className="text-sm text-cyan-400 hover:text-cyan-300">
              查看全部 →
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.length > 0 ? recentUsers.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div>
                  <p className="text-white text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-zinc-500">{user.full_name || '未设置昵称'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400">{formatTime(user.created_at)}</p>
                  <p className="text-xs text-cyan-400">{user.user_credits?.balance || 0} 积分</p>
                </div>
              </div>
            )) : (
              <p className="text-zinc-500 text-center py-4">暂无用户</p>
            )}
          </div>
        </div>

        {/* 最新交易 */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-400" />
              最新交易记录
            </h2>
            <Link href="/zh/admin/transactions" className="text-sm text-cyan-400 hover:text-cyan-300">
              查看全部 →
            </Link>
          </div>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? recentTransactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div>
                  <p className="text-white text-sm font-medium">{tx.profiles?.email || '未知用户'}</p>
                  <p className="text-xs text-zinc-500 truncate max-w-[200px]">{tx.description}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </p>
                  <p className="text-xs text-zinc-500">{formatTime(tx.created_at)}</p>
                </div>
              </div>
            )) : (
              <p className="text-zinc-500 text-center py-4">暂无交易</p>
            )}
          </div>
        </div>
      </div>

      {/* 系统信息 */}
      <div className="mt-8 bg-zinc-900/50 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">系统配置</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <p className="text-zinc-400 text-xs">3D 引擎</p>
            <p className="text-white font-medium">SAM-3 (Fal.ai)</p>
          </div>
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <p className="text-zinc-400 text-xs">生成成本</p>
            <p className="text-white font-medium">9 积分/次</p>
          </div>
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <p className="text-zinc-400 text-xs">下载成本</p>
            <p className="text-white font-medium">5 积分 (Free/Starter)</p>
          </div>
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <p className="text-zinc-400 text-xs">邀请奖励</p>
            <p className="text-white font-medium">5 积分/人</p>
          </div>
        </div>
      </div>
    </div>
  );
}
