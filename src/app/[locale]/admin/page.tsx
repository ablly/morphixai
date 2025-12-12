'use client';

import { useEffect, useState } from 'react';
import { Users, Image, CreditCard, TrendingUp, Loader2 } from 'lucide-react';

interface Stats {
  totalUsers: number;
  todayUsers: number;
  totalGenerations: number;
  todayGenerations: number;
  totalRevenue: number;
  todayRevenue: number;
  totalSpent: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
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
      subValue: `今日 +${stats?.todayUsers || 0}`,
      icon: Users,
      color: 'cyan',
    },
    {
      title: '总生成数',
      value: stats?.totalGenerations || 0,
      subValue: `今日 +${stats?.todayGenerations || 0}`,
      icon: Image,
      color: 'purple',
    },
    {
      title: '总积分购买',
      value: stats?.totalRevenue || 0,
      subValue: `今日 +${stats?.todayRevenue || 0}`,
      icon: CreditCard,
      color: 'green',
    },
    {
      title: '总积分消耗',
      value: stats?.totalSpent || 0,
      subValue: '用户使用',
      icon: TrendingUp,
      color: 'orange',
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
      <h1 className="text-2xl font-bold text-white mb-8">仪表盘</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const colors = colorClasses[card.color];
          return (
            <div
              key={card.title}
              className="bg-zinc-900/50 border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colors.bg} ring-1 ${colors.ring}`}>
                  <card.icon className={`w-6 h-6 ${colors.text}`} />
                </div>
              </div>
              <h3 className="text-zinc-400 text-sm">{card.title}</h3>
              <p className="text-3xl font-bold text-white mt-1">{card.value.toLocaleString()}</p>
              <p className="text-sm text-zinc-500 mt-2">{card.subValue}</p>
            </div>
          );
        })}
      </div>

      {/* 快速操作 */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">快速操作</h2>
          <div className="space-y-3">
            <a href="/zh/admin/users" className="block p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
              <p className="text-white font-medium">用户管理</p>
              <p className="text-sm text-zinc-400">查看、搜索、编辑用户信息</p>
            </a>
            <a href="/zh/admin/generations" className="block p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
              <p className="text-white font-medium">生成记录</p>
              <p className="text-sm text-zinc-400">查看所有 3D 模型生成记录</p>
            </a>
            <a href="/zh/admin/transactions" className="block p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
              <p className="text-white font-medium">交易记录</p>
              <p className="text-sm text-zinc-400">查看积分交易历史</p>
            </a>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">系统信息</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-zinc-400">平台版本</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-zinc-400">3D 引擎</span>
              <span className="text-white">SAM-3 (Fal.ai)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-zinc-400">生成成本</span>
              <span className="text-white">9 积分/次</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-zinc-400">邀请奖励</span>
              <span className="text-white">5 积分/人</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
