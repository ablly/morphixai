'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Mail, RefreshCw, Search, Eye, Edit3 } from 'lucide-react';
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

const DEFAULT_EMAIL_TEMPLATES = {
  technical: '由于技术原因，您的3D模型生成未能完成。我们的团队正在调查此问题。',
  image_quality: '您上传的图片可能不太适合3D转换。建议使用清晰、光线充足、主体明确的图片重试。',
  server_busy: '由于服务器繁忙，您的生成请求超时。请稍后重试，我们已退还您的积分。',
  custom: '',
};

export default function FailedGenerationsPage() {
  const [generations, setGenerations] = useState<FailedGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [selectedGeneration, setSelectedGeneration] = useState<FailedGeneration | null>(null);
  
  // 邮件编辑状态
  const [emailSubject, setEmailSubject] = useState('');
  const [emailReason, setEmailReason] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof DEFAULT_EMAIL_TEMPLATES>('technical');

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

  const openEmailEditor = (gen: FailedGeneration) => {
    setSelectedGeneration(gen);
    setEmailSubject('您的3D模型生成遇到问题 - 积分已退还');
    setEmailReason(gen.error_message || DEFAULT_EMAIL_TEMPLATES.technical);
    setSelectedTemplate('custom');
  };

  const applyTemplate = (template: keyof typeof DEFAULT_EMAIL_TEMPLATES) => {
    setSelectedTemplate(template);
    if (template !== 'custom') {
      setEmailReason(DEFAULT_EMAIL_TEMPLATES[template]);
    }
  };

  const sendNotificationEmail = async () => {
    if (!selectedGeneration) return;
    
    setSendingEmail(selectedGeneration.id);
    try {
      const res = await fetch('/api/admin/failed-generations/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationId: selectedGeneration.id,
          userId: selectedGeneration.user_id,
          userEmail: selectedGeneration.user_email,
          userName: selectedGeneration.user_name,
          subject: emailSubject,
          reason: emailReason,
          creditsRefunded: selectedGeneration.credits_used,
        }),
      });
      
      if (res.ok) {
        setGenerations(prev => 
          prev.map(g => g.id === selectedGeneration.id ? { ...g, notified: true } : g)
        );
        setSelectedGeneration(null);
        setEmailSubject('');
        setEmailReason('');
        alert('邮件发送成功！');
      } else {
        const data = await res.json();
        alert(`邮件发送失败: ${data.error || '未知错误'}`);
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
    g.error_message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
          placeholder="搜索邮箱、用户名或错误信息..."
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
                    <span className="text-zinc-500 text-sm">({gen.user_name})</span>
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
                    {gen.error_message || '生成过程中发生未知错误'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>积分: {gen.credits_used}</span>
                    <span>时间: {new Date(gen.completed_at || gen.created_at).toLocaleString('zh-CN')}</span>
                    <span className="text-zinc-600">ID: {gen.id.slice(0, 8)}...</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
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
                      onClick={() => openEmailEditor(gen)}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      编辑邮件
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 详情/邮件编辑弹窗 */}
      {selectedGeneration && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {selectedGeneration.notified ? '生成详情' : '编辑并发送通知邮件'}
              </h3>
              <button 
                onClick={() => {
                  setSelectedGeneration(null);
                  setEmailSubject('');
                  setEmailReason('');
                }}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {/* 用户信息 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-zinc-500 mb-1">用户邮箱</p>
                <p className="text-white">{selectedGeneration.user_email}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">用户名</p>
                <p className="text-white">{selectedGeneration.user_name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">退还积分</p>
                <p className="text-green-400">{selectedGeneration.credits_used} 积分</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">失败时间</p>
                <p className="text-white text-sm">
                  {new Date(selectedGeneration.completed_at || selectedGeneration.created_at).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>

            {/* 原始错误信息 */}
            <div className="mb-6">
              <p className="text-xs text-zinc-500 mb-2">原始错误信息</p>
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                <p className="text-red-400 text-sm">{selectedGeneration.error_message || '无错误信息'}</p>
              </div>
            </div>

            {/* 源图片 */}
            {selectedGeneration.source_image_url && (
              <div className="mb-6">
                <p className="text-xs text-zinc-500 mb-2">源图片</p>
                <img 
                  src={selectedGeneration.source_image_url} 
                  alt="Source" 
                  className="w-32 h-32 object-cover rounded border border-zinc-700"
                />
              </div>
            )}

            {/* 邮件编辑区域 - 仅未通知时显示 */}
            {!selectedGeneration.notified && (
              <>
                <hr className="border-zinc-700 my-6" />
                
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  邮件内容编辑
                </h4>

                {/* 快速模板 */}
                <div className="mb-4">
                  <p className="text-xs text-zinc-500 mb-2">快速模板</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => applyTemplate('technical')}
                      className={`px-3 py-1.5 text-xs rounded-lg transition ${
                        selectedTemplate === 'technical' 
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      技术问题
                    </button>
                    <button
                      onClick={() => applyTemplate('image_quality')}
                      className={`px-3 py-1.5 text-xs rounded-lg transition ${
                        selectedTemplate === 'image_quality' 
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      图片质量
                    </button>
                    <button
                      onClick={() => applyTemplate('server_busy')}
                      className={`px-3 py-1.5 text-xs rounded-lg transition ${
                        selectedTemplate === 'server_busy' 
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      服务器繁忙
                    </button>
                    <button
                      onClick={() => applyTemplate('custom')}
                      className={`px-3 py-1.5 text-xs rounded-lg transition ${
                        selectedTemplate === 'custom' 
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      自定义
                    </button>
                  </div>
                </div>

                {/* 邮件主题 */}
                <div className="mb-4">
                  <p className="text-xs text-zinc-500 mb-2">邮件主题</p>
                  <Input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="邮件主题"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>

                {/* 失败原因/邮件正文 */}
                <div className="mb-6">
                  <p className="text-xs text-zinc-500 mb-2">失败原因说明（将发送给用户）</p>
                  <textarea
                    value={emailReason}
                    onChange={(e) => {
                      setEmailReason(e.target.value);
                      setSelectedTemplate('custom');
                    }}
                    placeholder="请输入要告知用户的失败原因..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-cyan-500"
                    rows={4}
                  />
                </div>

                {/* 邮件预览 */}
                <div className="mb-6 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                  <p className="text-xs text-zinc-500 mb-2">邮件预览</p>
                  <div className="text-sm text-zinc-300 space-y-2">
                    <p>收件人: <span className="text-white">{selectedGeneration.user_email}</span></p>
                    <p>主题: <span className="text-white">{emailSubject || '(未设置)'}</span></p>
                    <hr className="border-zinc-700" />
                    <p className="text-zinc-400">Hi {selectedGeneration.user_name},</p>
                    <p className="text-yellow-400">{emailReason || '(未设置原因)'}</p>
                    <p className="text-green-400">✅ 已退还 {selectedGeneration.credits_used} 积分</p>
                    <p className="text-zinc-400">如有问题请联系我们的支持团队。</p>
                  </div>
                </div>
              </>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedGeneration(null);
                  setEmailSubject('');
                  setEmailReason('');
                }}
              >
                关闭
              </Button>
              {!selectedGeneration.notified && (
                <Button
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                  onClick={sendNotificationEmail}
                  disabled={sendingEmail === selectedGeneration.id || !emailReason.trim()}
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
