'use client';

import { useEffect, useState } from 'react';
import { Loader2, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  credits_awarded: number;
  created_at: string;
  referrer: { email: string; full_name: string | null } | null;
  referred: { email: string; full_name: string | null } | null;
}

interface ReferralsResponse {
  referrals: Referral[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminReferralsPage() {
  const [data, setData] = useState<ReferralsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchReferrals();
  }, [page]);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      const res = await fetch(`/api/admin/referrals?${params}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">邀请记录</h1>

      {/* Stats */}
      <div className="mb-6 bg-zinc-900/50 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-lg ring-1 ring-purple-500/30">
            <UserPlus className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm">总邀请数</p>
            <p className="text-2xl font-bold text-white">{data?.total || 0}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">邀请人</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">被邀请人</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">奖励积分</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">邀请时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : data?.referrals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-400">
                    暂无邀请记录
                  </td>
                </tr>
              ) : data?.referrals.map((ref) => (
                <tr key={ref.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{ref.referrer?.full_name || '未设置'}</p>
                      <p className="text-sm text-zinc-400">{ref.referrer?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{ref.referred?.full_name || '未设置'}</p>
                      <p className="text-sm text-zinc-400">{ref.referred?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-purple-400 font-medium">+{ref.credits_awarded}</span>
                    <span className="text-zinc-500 text-sm ml-1">积分/人</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">
                    {new Date(ref.created_at).toLocaleString('zh-CN')}
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
