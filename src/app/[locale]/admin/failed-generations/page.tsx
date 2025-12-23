'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Mail, RefreshCw, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FailedGeneration {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  error_message: string;
  credits_used: number;
  created_at: string;
  completed_at: string;
  source_image_url: string;
  notified: boolean;
}

export default function FailedGenerationsPage() {
  const [generations, setGenerations] = useState<FailedGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState<FailedGeneration | null>(null);

  useEffect(() => {
    fetchFailedGenerations();
  }, []);

  const fetchFailedGenerations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/failed-generations');
      const data = await res.json();
      if (data.generations) {
        setGenerations(data.generations);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendNotificationEmail = async (generation: FailedGeneration, message: string) => {
    setSendingEmail(generation.id);
    try {
      const res = await fetch('/api/admin/failed-generations/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationId: generation.id,
          userId: generation.user_id,
          userEmail: generation.user_email,
          userName: generation.user_name,
          reason: message || generation.error_message,
          creditsRefunded: generation.credits_used,
        }),
      });
      
      if (res.ok) {
        // 更新本地状态
        setGenerations(prev => 
          prev.map(g => g.id === generation.id ? { ...g, notified: true } : g)
        );
        setSelectedGeneration(null);
        setCustomMessage('');
        alert('邮件发送成功！');
      } else {
        alert('邮件发送失败');
      }
    } catch (error) {
      console.error('Send email error:', error);
      alert('邮件发送失败');
    } finally {
      setSendingEmail(null);
    }
  };

  const filteredGenerations = generations.filter(g => 
    g.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.error_message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            失败生成管理
          </h1>
          <p className="text-zinc-400 mt-1">查看失败的生成记录并通知用户</p>
        </div>
        <Button onClick={fetchFailedGenerations} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* 搜索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          placeholder="搜索邮箱或错误信息..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-zinc-900 border-zinc-700"
        />
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">总失败数</p>
          <p className="text-2xl font-bold text-red-500">{generations.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">已通知</p>
          <p className="text-2xl font-bold text-green-500">
            {generations.filter(g => g.notified).length}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">待处理</p>
          <p className="text-2xl font-bold text-yellow-500">
            {generations.filter(g => !g.notified).length}
          </p>
        </div>
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="text-center py-10 text-zinc-400">加载中...</div>
      ) : filteredGenerations.length === 0 ? (
        <div className="text-center py-10 text-zinc-400">
          {searchTerm ? '没有匹配的记录' : '暂无失败的生成记录 🎉'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGenerations.map((gen) => (
            <div
              key={gen.id}
              className={`bg-zinc-900 border rounded-lg p-4 ${
                gen.notified ? 'border-zinc-800' : 'border-yellow-500/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-medium">{gen.user_email}</span>
                    {gen.notified ? (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                        已通知
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                        待处理
                      </span>
                    )}
                  </div>
                  <p className="text-red-400 text-sm mb-2 line-clamp-2">
                    {gen.error_message || '未知错误'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>积分: {gen.credits_used}</span>
                    <span>时间: {new Date(gen.completed_at || gen.created_at).toLocaleString('zh-CN')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedGeneration(gen)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    详情
                  </Button>
                  {!gen.notified && (
                    <Button
                      size="sm"
                      onClick={() => sendNotificationEmail(gen, gen.error_message)}
                      disabled={sendingEmail === gen.id}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      {sendingEmail === gen.id ? '发送中...' : '通知用户'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 详情弹窗 */}
      {selectedGeneration && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-white mb-4">生成详情</h3>
            
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-xs text-zinc-500">用户邮箱</p>
                <p className="text-white">{selectedGeneration.user_email}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">错误信息</p>
                <p className="text-red-400 text-sm">{selectedGeneration.error_message}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">退还积分</p>
                <p className="text-green-400">{selectedGeneration.credits_used} 积分</p>
              </div>
              {selectedGeneration.source_image_url && (
                <div>
                  <p className="text-xs text-zinc-500 mb-2">源图片</p>
                  <img 
                    src={selectedGeneration.source_image_url} 
                    alt="Source" 
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>

            {!selectedGeneration.notified && (
              <div className="mb-4">
                <p className="text-xs text-zinc-500 mb-2">自定义通知消息（可选）</p>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={selectedGeneration.error_message}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white text-sm resize-none"
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedGeneration(null);
                  setCustomMessage('');
                }}
              >
                关闭
              </Button>
              {!selectedGeneration.notified && (
                <Button
                  className="flex-1"
                  onClick={() => sendNotificationEmail(
                    selectedGeneration, 
                    customMessage || selectedGeneration.error_message
                  )}
                  disabled={sendingEmail === selectedGeneration.id}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {sendingEmail === selectedGeneration.id ? '发送中...' : '发送通知邮件'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
