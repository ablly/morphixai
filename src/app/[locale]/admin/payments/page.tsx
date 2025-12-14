'use client';

import { useEffect, useState } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Filter, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentIntent {
  id: string;
  user_id: string;
  stripe_session_id: string | null;
  package_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  profiles: { email: string; full_name: string | null } | null;
}

interface PaymentIntentsResponse {
  paymentIntents: PaymentIntent[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminPaymentsPage() {
  const [data, setData] = useState<PaymentIntentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPaymentIntents();
  }, [page, statusFilter]);

  const fetchPaymentIntents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      
      const res = await fetch(`/api/admin/payment-intents?${params}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch payment intents:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusLabels: Record<string, string> = {
    pending: '待支付',
    completed: '已完成',
    cancelled: '已取消',
    expired: '已过期',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    completed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
    expired: 'bg-zinc-500/20 text-zinc-400',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-4 h-4" />,
    completed: <CheckCircle className="w-4 h-4" />,
    cancelled: <XCircle className="w-4 h-4" />,
    expired: <XCircle className="w-4 h-4" />,
  };

  const packageLabels: Record<string, string> = {
    starter: 'Starter (1000积分)',
    creator: 'Creator (3500积分)',
    pro: 'Pro (12000积分)',
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <CreditCard className="w-8 h-8 text-cyan-400" />
        <h1 className="text-2xl font-bold text-white">支付记录</h1>
      </div>

      <p className="text-zinc-400 mb-6">
        实时记录用户点击购买按钮的行为，包括未完成的支付
      </p>

      {/* Filters */}
      <div className="mb-6 flex gap-4 items-center">
        <Filter className="w-5 h-5 text-zinc-400" />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-2 text-white"
        >
          <option value="">全部状态</option>
          <option value="pending">待支付</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
          <option value="expired">已过期</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">用户</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">套餐</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">金额</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">状态</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">点击时间</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">完成时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : data?.paymentIntents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    暂无支付记录
                  </td>
                </tr>
              ) : data?.paymentIntents.map((intent) => (
                <tr key={intent.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{intent.profiles?.full_name || '未设置'}</p>
                      <p className="text-sm text-zinc-400">{intent.profiles?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-cyan-400 font-medium">
                      {packageLabels[intent.package_id] || intent.package_id}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white font-mono">
                    ${(intent.amount_cents / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${statusColors[intent.status] || 'bg-zinc-700 text-zinc-300'}`}>
                      {statusIcons[intent.status]}
                      {statusLabels[intent.status] || intent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">
                    {new Date(intent.created_at).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">
                    {intent.completed_at 
                      ? new Date(intent.completed_at).toLocaleString('zh-CN')
                      : '-'
                    }
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
