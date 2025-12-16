'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Loader2,
  RefreshCw,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StripePayment {
  id: string;
  paymentIntentId: string | null;
  amount: number;
  amountSubtotal: number;
  currency: string;
  status: string;
  sessionStatus: string;
  created: number;
  customerEmail: string | null;
  customerName: string | null;
  metadata: Record<string, string>;
  promoCode: string | null;
  discountAmount: number;
  originalAmount: number;
  receiptUrl: string | null;
  packageId: string;
  userId: string;
}

interface StripeResponse {
  payments: StripePayment[];
  hasMore: boolean;
  lastId: string | null;
}

const packageLabels: Record<string, string> = {
  starter: 'Starter (1000积分)',
  creator: 'Creator (3500积分)',
  pro: 'Pro (12000积分)',
};

export default function AdminStripePage() {
  const [data, setData] = useState<StripeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchPayments = useCallback(
    async (startingAfter?: string) => {
      if (startingAfter) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams({ limit: '20' });
        if (startingAfter) params.set('starting_after', startingAfter);

        const res = await fetch(`/api/admin/stripe/payments?${params}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch');
        }

        const result: StripeResponse = await res.json();

        if (startingAfter && data) {
          setData({
            ...result,
            payments: [...data.payments, ...result.payments],
          });
        } else {
          setData(result);
        }
        setLastRefresh(new Date());
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [data]
  );

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchPayments(), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchPayments]);

  const statusConfig: Record<
    string,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    paid: {
      label: '已支付',
      color: 'bg-green-500/20 text-green-400',
      icon: <CheckCircle className="w-4 h-4" />,
    },
    unpaid: {
      label: '未支付',
      color: 'bg-yellow-500/20 text-yellow-400',
      icon: <Clock className="w-4 h-4" />,
    },
    no_payment_required: {
      label: '无需支付',
      color: 'bg-blue-500/20 text-blue-400',
      icon: <AlertCircle className="w-4 h-4" />,
    },
    expired: {
      label: '已过期',
      color: 'bg-zinc-500/20 text-zinc-400',
      icon: <XCircle className="w-4 h-4" />,
    },
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl">
            <Zap className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Stripe 实时数据</h1>
            <p className="text-sm text-zinc-400">
              直接从 Stripe API 获取的支付记录
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-white/20 bg-zinc-800"
            />
            自动刷新 (30s)
          </label>
          <Button
            onClick={() => fetchPayments()}
            disabled={loading}
            variant="outline"
            className="border-white/10"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            刷新
          </Button>
        </div>
      </div>

      {/* Last refresh time */}
      {lastRefresh && (
        <p className="text-xs text-zinc-500 mb-4">
          最后更新: {lastRefresh.toLocaleString('zh-CN')}
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <p className="font-medium">获取数据失败</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-medium text-zinc-400">
                  客户
                </th>
                <th className="px-4 py-4 text-left text-sm font-medium text-zinc-400">
                  套餐
                </th>
                <th className="px-4 py-4 text-left text-sm font-medium text-zinc-400">
                  原价
                </th>
                <th className="px-4 py-4 text-left text-sm font-medium text-zinc-400">
                  实付
                </th>
                <th className="px-4 py-4 text-left text-sm font-medium text-zinc-400">
                  促销码
                </th>
                <th className="px-4 py-4 text-left text-sm font-medium text-zinc-400">
                  状态
                </th>
                <th className="px-4 py-4 text-left text-sm font-medium text-zinc-400">
                  时间
                </th>
                <th className="px-4 py-4 text-left text-sm font-medium text-zinc-400">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && !data ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
                    <p className="text-zinc-400 mt-2">
                      正在从 Stripe 获取数据...
                    </p>
                  </td>
                </tr>
              ) : data?.payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    暂无支付记录
                  </td>
                </tr>
              ) : (
                data?.payments.map((payment) => {
                  const status = statusConfig[payment.status] || {
                    label: payment.status,
                    color: 'bg-zinc-700 text-zinc-300',
                    icon: <CreditCard className="w-4 h-4" />,
                  };

                  return (
                    <tr key={payment.id} className="hover:bg-white/5">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-white font-medium">
                            {payment.customerName || '访客'}
                          </p>
                          <p className="text-sm text-zinc-400 truncate max-w-[200px]">
                            {payment.customerEmail || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-cyan-400 font-medium text-sm">
                          {packageLabels[payment.packageId] || payment.packageId}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {payment.discountAmount > 0 ? (
                          <span className="text-zinc-400 line-through font-mono text-sm">
                            {formatCurrency(
                              payment.originalAmount,
                              payment.currency
                            )}
                          </span>
                        ) : (
                          <span className="text-zinc-400 font-mono text-sm">
                            {formatCurrency(payment.amount, payment.currency)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-green-400 font-mono font-medium">
                          {formatCurrency(payment.amount, payment.currency)}
                        </span>
                        {payment.discountAmount > 0 && (
                          <span className="ml-2 text-xs text-orange-400">
                            (-
                            {formatCurrency(
                              payment.discountAmount,
                              payment.currency
                            )}
                            )
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {payment.promoCode ? (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-mono">
                            {payment.promoCode}
                          </span>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${status.color}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-zinc-400 text-sm">
                        {new Date(payment.created * 1000).toLocaleString(
                          'zh-CN'
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          {payment.paymentIntentId && (
                            <a
                              href={`https://dashboard.stripe.com/payments/${payment.paymentIntentId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300 transition-colors"
                              title="在 Stripe 中查看"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {payment.receiptUrl && (
                            <a
                              href={payment.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 transition-colors"
                              title="查看收据"
                            >
                              <CreditCard className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Load More */}
        {data?.hasMore && (
          <div className="p-4 border-t border-white/10 text-center">
            <Button
              onClick={() => data.lastId && fetchPayments(data.lastId)}
              disabled={loadingMore}
              variant="outline"
              className="border-white/10"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  加载中...
                </>
              ) : (
                '加载更多'
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      {data && data.payments.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">成功支付</p>
            <p className="text-2xl font-bold text-green-400">
              {data.payments.filter((p) => p.status === 'paid').length}
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">总收入</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(
                data.payments
                  .filter((p) => p.status === 'paid')
                  .reduce((sum, p) => sum + p.amount, 0),
                'usd'
              )}
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">使用促销码</p>
            <p className="text-2xl font-bold text-purple-400">
              {data.payments.filter((p) => p.promoCode).length}
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">总折扣</p>
            <p className="text-2xl font-bold text-orange-400">
              {formatCurrency(
                data.payments.reduce((sum, p) => sum + p.discountAmount, 0),
                'usd'
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
