'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Filter, RefreshCw, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

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
  fal_request_id: string | null;
  metadata: { error?: { status?: number; message?: string }; failed_at?: string } | null;
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
  const [isRealtime, setIsRealtime] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);

  const fetchGenerations = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      
      const res = await fetch(`/api/admin/generations?${params}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch generations:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  // 初始加载
  useEffect(() => {
    fetchGenerations();
  }, [fetchGenerations]);

  // Supabase Realtime 订阅
  useEffect(() => {
    const supabase = createClient();
    
    // 订阅 generations 表的变化
    const channel = supabase
      .channel('admin-generations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generations',
        },
        (payload) => {
          console.log('[Realtime] Generation change:', payload.eventType, payload.new);
          // 收到变化时刷新数据（不显示 loading）
          fetchGenerations(false);
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
        setIsRealtime(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchGenerations]);

  // 同步处理中的任务状态（与 fal.ai 核对）
  const syncProcessingTasks = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/generations/sync', { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        console.log('[Sync] Result:', result);
        // 刷新数据
        await fetchGenerations(false);
      }
    } catch (error) {
      console.error('Failed to sync:', error);
    } finally {
      setSyncing(false);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    PROCESSING: 'bg-blue-500/20 text-blue-400',
    COMPLETED: 'bg-green-500/20 text-green-400',
    FAILED: 'bg-red-500/20 text-red-400',
  };

  // 计算处理中的任务数量
  const processingCount = data?.generations.filter(g => 
    g.status === 'PROCESSING' || g.status === 'PENDING'
  ).length || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">生成记录</h1>
        
        {/* 实时状态指示器 */}
        <div className="flex items-center gap-4">
          {/* 实时连接状态 */}
          <div className="flex items-center gap-2 text-sm">
            {isRealtime ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-green-400">实时同步</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-500">离线</span>
              </>
            )}
          </div>

          {/* 最后更新时间 */}
          {lastUpdate && (
            <span className="text-xs text-zinc-500">
              更新于 {lastUpdate.toLocaleTimeString('zh-CN')}
            </span>
          )}

          {/* 同步按钮 */}
          <Button
            size="sm"
            variant="outline"
            onClick={syncProcessingTasks}
            disabled={syncing || processingCount === 0}
            className="border-white/10 gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? '同步中...' : `同步状态 (${processingCount})`}
          </Button>
        </div>
      </div>

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
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">错误信息</th>
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
                    {gen.status === 'FAILED' && gen.metadata?.error ? (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-sm">
                          {gen.metadata.error.status === 403 ? 'API余额不足' : 
                           gen.metadata.error.status === 401 ? 'API密钥无效' :
                           gen.metadata.error.message || '未知错误'}
                        </span>
                      </div>
                    ) : gen.status === 'FAILED' ? (
                      <span className="text-red-400 text-sm">生成失败</span>
                    ) : (
                      <span className="text-zinc-500">-</span>
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
