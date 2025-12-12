'use client';

import { useEffect, useState } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Generation {
  id: string;
  user_id: string;
  source_image_url: string;
  status: string;
  credits_used: number;
  model_url: string | null;
  mode: string;
  engine: string;
  is_private: boolean;
  created_at: string;
  completed_at: string | null;
  profiles: { email: string; full_name: string | null } | null;
}

interface GenerationsResponse {
  generations: Generation[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminGenerationsPage() {
  const [data, setData] = useState<GenerationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchGenerations();
  }, [page, statusFilter]);

  const fetchGenerations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      
      const res = await fetch(`/api/admin/generations?${params}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch generations:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    PROCESSING: 'bg-blue-500/20 text-blue-400',
    COMPLETED: 'bg-green-500/20 text-green-400',
    FAILED: 'bg-red-500/20 text-red-400',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">生成记录</h1>

      {/* Filters */}
      <div className="mb-6 flex gap-4 items-center">
        <Filter className="w-5 h-5 text-zinc-400" />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-2 text-white"
        >
          <option value="">全部状态</option>
          <option value="PENDING">等待中</option>
          <option value="PROCESSING">处理中</option>
          <option value="COMPLETED">已完成</option>
          <option value="FAILED">失败</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">用户</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">状态</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">模式</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">引擎</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">积分</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">私密</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">创建时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : data?.generations.map((gen) => (
                <tr key={gen.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{gen.profiles?.full_name || '未设置'}</p>
                      <p className="text-sm text-zinc-400">{gen.profiles?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[gen.status] || 'bg-zinc-700 text-zinc-300'}`}>
                      {gen.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{gen.mode || 'IMAGE_TO_3D'}</td>
                  <td className="px-6 py-4 text-zinc-300">{gen.engine || 'fal-ai'}</td>
                  <td className="px-6 py-4 text-cyan-400">{gen.credits_used}</td>
                  <td className="px-6 py-4">
                    {gen.is_private ? (
                      <span className="text-yellow-400">是</span>
                    ) : (
                      <span className="text-zinc-500">否</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">
                    {new Date(gen.created_at).toLocaleString('zh-CN')}
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
