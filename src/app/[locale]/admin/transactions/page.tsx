'use client';

import { useEffect, useState } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  balance_after: number;
  description: string;
  reference_id: string | null;
  created_at: string;
  profiles: { email: string; full_name: string | null } | null;
}

interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminTransactionsPage() {
  const [data, setData] = useState<TransactionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [page, typeFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (typeFilter) params.set('type', typeFilter);
      
      const res = await fetch(`/api/admin/transactions?${params}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const typeLabels: Record<string, string> = {
    PURCHASE: '购买',
    GENERATION: '生成消耗',
    REFUND: '退款',
    REFERRAL: '邀请奖励',
    SOCIAL_SHARE: '分享奖励',
    WELCOME: '注册奖励',
  };

  const typeColors: Record<string, string> = {
    PURCHASE: 'bg-green-500/20 text-green-400',
    GENERATION: 'bg-red-500/20 text-red-400',
    REFUND: 'bg-yellow-500/20 text-yellow-400',
    REFERRAL: 'bg-purple-500/20 text-purple-400',
    SOCIAL_SHARE: 'bg-blue-500/20 text-blue-400',
    WELCOME: 'bg-cyan-500/20 text-cyan-400',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">交易记录</h1>

      {/* Filters */}
      <div className="mb-6 flex gap-4 items-center">
        <Filter className="w-5 h-5 text-zinc-400" />
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-2 text-white"
        >
          <option value="">全部类型</option>
          <option value="PURCHASE">购买</option>
          <option value="GENERATION">生成消耗</option>
          <option value="REFUND">退款</option>
          <option value="REFERRAL">邀请奖励</option>
          <option value="WELCOME">注册奖励</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">用户</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">类型</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">金额</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">余额</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">描述</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : data?.transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{tx.profiles?.full_name || '未设置'}</p>
                      <p className="text-sm text-zinc-400">{tx.profiles?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${typeColors[tx.type] || 'bg-zinc-700 text-zinc-300'}`}>
                      {typeLabels[tx.type] || tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {tx.amount > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={tx.amount > 0 ? 'text-green-400' : 'text-red-400'}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{tx.balance_after}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm max-w-xs truncate">
                    {tx.description}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">
                    {new Date(tx.created_at).toLocaleString('zh-CN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
            <p className="text-sm text-zinc-400">
              共 {data.total} 条记录，第 {data.page} / {data.totalPages} 页
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="border-white/10"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
