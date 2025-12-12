'use client';

import { useEffect, useState } from 'react';
import { Search, Loader2, ChevronLeft, ChevronRight, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  referral_code: string;
  plan_tier: string;
  created_at: string;
  user_credits: { balance: number; total_earned: number; total_spent: number } | null;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (search) params.set('search', search);
      
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleUpdateCredits = async () => {
    if (!editingUser || !creditAmount || !creditReason) return;
    
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(creditAmount),
          reason: creditReason,
        }),
      });

      if (res.ok) {
        setEditingUser(null);
        setCreditAmount('');
        setCreditReason('');
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update credits:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">用户管理</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索邮箱或用户名..."
              className="pl-10 bg-zinc-900/50 border-white/10 text-white"
            />
          </div>
          <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">搜索</Button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">用户</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">角色</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">套餐</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">积分</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">邀请码</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">注册时间</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : data?.users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{user.full_name || '未设置'}</p>
                      <p className="text-sm text-zinc-400">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-700 text-zinc-300'
                    }`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-zinc-300">{user.plan_tier || 'free'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-cyan-400 font-medium">
                      {user.user_credits?.balance || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-300">
                      {user.referral_code}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">
                    {new Date(user.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingUser(user)}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
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

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">调整积分</h2>
              <button onClick={() => setEditingUser(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-zinc-400 text-sm">用户</p>
              <p className="text-white">{editingUser.email}</p>
              <p className="text-cyan-400 mt-1">当前积分: {editingUser.user_credits?.balance || 0}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">调整数量（正数增加，负数扣除）</label>
                <Input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="例如: 100 或 -50"
                  className="bg-zinc-800 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">原因</label>
                <Input
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  placeholder="例如: 补偿积分"
                  className="bg-zinc-800 border-white/10 text-white"
                />
              </div>
              <Button
                onClick={handleUpdateCredits}
                disabled={updating || !creditAmount || !creditReason}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                确认调整
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
