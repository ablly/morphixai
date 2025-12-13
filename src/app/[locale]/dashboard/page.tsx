'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { FixedUI } from '@/components/FixedUI';
import { ShareDialog } from '@/components/ShareDialog';
import { useToast } from '@/components/ui/toast';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { DashboardSkeleton } from '@/components/ui/skeleton';
import { LazyImage } from '@/components/ui/lazy-image';
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import { Plus, Search, Download, Trash2, Share2, Coins, ArrowLeft, Gift, X, Filter, SortDesc, Shield } from 'lucide-react';

interface Generation {
  id: string;
  thumbnail_url: string | null;
  model_url: string | null;
  status: string;
  quality: string;
  credits_used: number;
  created_at: string;
  mode?: string;
  output_format?: string;
  has_license?: boolean;
}

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [credits, setCredits] = useState(0);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [showFreeCreditsPopup, setShowFreeCreditsPopup] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // 键盘快捷键
  useKeyboardShortcuts([
    {
      ...COMMON_SHORTCUTS.goCreate,
      handler: () => router.push(`/${locale}/create`),
    },
    {
      ...COMMON_SHORTCUTS.goHome,
      handler: () => router.push(`/${locale}`),
    },
    {
      ...COMMON_SHORTCUTS.goSettings,
      handler: () => router.push(`/${locale}/settings`),
    },
    {
      ...COMMON_SHORTCUTS.search,
      handler: () => {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      },
    },
  ]);

  // 处理支付成功/订阅成功的提示
  useEffect(() => {
    const success = searchParams.get('success');
    const subscription = searchParams.get('subscription');
    
    if (success === 'true') {
      addToast('success', locale === 'zh' ? '购买成功！积分已添加到您的账户。' : 'Purchase successful! Credits have been added to your account.');
      // 清除 URL 参数
      router.replace(`/${locale}/dashboard`);
    }
    if (subscription === 'success') {
      addToast('success', locale === 'zh' ? '订阅成功！' : 'Subscription activated successfully!');
      router.replace(`/${locale}/dashboard`);
    }
  }, [searchParams, addToast, locale, router]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // 使用 getUser() 获取当前用户 (更可靠)
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      console.log('[Dashboard] Auth check:', { userId: user?.id, error: authError?.message });
      
      if (authError || !user) {
        console.log('[Dashboard] No authenticated user, redirecting to login');
        router.push(`/${locale}/login?redirect=/${locale}/dashboard`);
        return;
      }

      try {
        // 检查并处理邀请码 (首次登录时)
        const referralCode = user.user_metadata?.referral_code;
        if (referralCode) {
          // 检查是否已经处理过邀请
          const { data: profile } = await supabase
            .from('profiles')
            .select('referred_by')
            .eq('id', user.id)
            .single();
          
          // 如果还没有处理过邀请码
          if (!profile?.referred_by) {
            try {
              const res = await fetch('/api/referral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referralCode }),
              });
              
              if (res.ok) {
                addToast('success', locale === 'zh' 
                  ? '🎉 邀请奖励已发放！你和邀请人各获得 5 积分！' 
                  : '🎉 Referral bonus applied! You and your referrer each got 5 credits!');
              }
            } catch (err) {
              console.error('Failed to process referral:', err);
            }
          }
        }

        // 获取积分
        const { data: creditsData, error: creditsError } = await supabase
          .from('user_credits')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        if (!creditsError && creditsData) {
          setCredits(creditsData.balance);
        }

        // 获取生成记录
        const { data: generationsData, error: genError } = await supabase
          .from('generations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!genError && generationsData) {
          setGenerations(generationsData);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }

      setLoading(false);
    };

    fetchData();

    // 实时订阅生成状态更新和积分变化
    const setupRealtimeSubscriptions = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return { generationsChannel: null, creditsChannel: null, supabase: null };
      
      // 订阅 generations 变化 - 只监听当前用户的数据
      const generationsChannel = supabase
        .channel(`generations-${user.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'generations',
          filter: `user_id=eq.${user.id}` // 重要: 只监听当前用户的数据
        }, (payload) => {
          console.log('[Realtime] Generation update:', payload.eventType, payload.new);
          if (payload.eventType === 'UPDATE') {
            setGenerations(prev => prev.map(g => g.id === payload.new.id ? payload.new as Generation : g));
          } else if (payload.eventType === 'INSERT') {
            setGenerations(prev => [payload.new as Generation, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setGenerations(prev => prev.filter(g => g.id !== payload.old.id));
          }
        })
        .subscribe((status) => {
          console.log('[Realtime] Generations subscription status:', status);
        });

      // 订阅 user_credits 变化 - 只监听当前用户的积分
      const creditsChannel = supabase
        .channel(`credits-${user.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'user_credits',
          filter: `user_id=eq.${user.id}` // 重要: 只监听当前用户的积分
        }, (payload) => {
          console.log('[Realtime] Credits update:', payload.new);
          if (payload.new && 'balance' in payload.new) {
            setCredits((payload.new as { balance: number }).balance);
          }
        })
        .subscribe((status) => {
          console.log('[Realtime] Credits subscription status:', status);
        });

      return { generationsChannel, creditsChannel, supabase };
    };

    let cleanup: { generationsChannel: any; creditsChannel: any; supabase: any } | null = null;
    
    setupRealtimeSubscriptions().then(result => {
      if (result) cleanup = result;
    });

    return () => { 
      if (cleanup?.supabase) {
        if (cleanup.generationsChannel) cleanup.supabase.removeChannel(cleanup.generationsChannel);
        if (cleanup.creditsChannel) cleanup.supabase.removeChannel(cleanup.creditsChannel);
      }
    };
  }, [router, locale]);

  const handleDelete = async (generationId: string) => {
    const confirmed = await confirm({
      title: locale === 'zh' ? '删除模型' : 'Delete Model',
      message: locale === 'zh' ? '确定要删除这个3D模型吗？此操作无法撤销。' : 'Are you sure you want to delete this 3D model? This action cannot be undone.',
      confirmText: locale === 'zh' ? '删除' : 'Delete',
      cancelText: locale === 'zh' ? '取消' : 'Cancel',
      variant: 'danger',
    });
    
    if (!confirmed) return;
    
    setDeleting(generationId);
    const supabase = createClient();
    
    const { error } = await supabase
      .from('generations')
      .delete()
      .eq('id', generationId);

    if (!error) {
      setGenerations(prev => prev.filter(g => g.id !== generationId));
      addToast('success', locale === 'zh' ? '模型已删除' : 'Model deleted successfully');
    } else {
      addToast('error', locale === 'zh' ? '删除失败，请重试' : 'Failed to delete, please try again');
    }
    setDeleting(null);
  };

  const handleDownload = async (generation: Generation) => {
    if (!generation.model_url || generation.status !== 'COMPLETED') return;
    
    try {
      // Call download API to handle credits and verification
      const res = await fetch('/api/generate/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generationId: generation.id })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          addToast('error', data.error || (locale === 'zh' ? '积分不足，无法下载' : 'Insufficient credits to download'));
          return;
        }
        throw new Error(data.error || 'Download failed');
      }

      // Download the file
      const link = document.createElement('a');
      link.href = data.modelUrl;
      link.download = `morphix-${generation.mode || 'model'}-${Date.now()}.glb`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update credits if charged
      if (data.charged) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: creditsData } = await supabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', user.id)
            .single();
          if (creditsData) setCredits(creditsData.balance);
        }
        addToast('success', locale === 'zh' ? '下载成功，已扣除5积分' : 'Download successful, 5 credits deducted');
      } else {
        addToast('success', locale === 'zh' ? '下载成功 (Creator/Pro 免费下载)' : 'Download successful (Free for Creator/Pro)');
      }
    } catch (err: any) {
      console.error('Download error:', err);
      addToast('error', err.message || (locale === 'zh' ? '下载失败' : 'Download failed'));
    }
  };

  const handlePurchaseLicense = async (generation: Generation) => {
    if (generation.status !== 'COMPLETED' || generation.has_license) return;
    
    const confirmed = await confirm({
      title: locale === 'zh' ? '购买商用授权' : 'Purchase Commercial License',
      message: locale === 'zh' 
        ? '商用授权需要 100 积分。购买后您将获得可打印的授权证书，允许您将此模型用于商业用途。' 
        : 'Commercial license costs 100 credits. You will receive a printable license certificate allowing commercial use of this model.',
      confirmText: locale === 'zh' ? '购买 (100积分)' : 'Purchase (100 credits)',
      cancelText: locale === 'zh' ? '取消' : 'Cancel',
      variant: 'info',
    });
    
    if (!confirmed) return;
    
    try {
      const res = await fetch('/api/generate/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generationId: generation.id })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          addToast('error', data.error || (locale === 'zh' ? '积分不足' : 'Insufficient credits'));
          return;
        }
        throw new Error(data.error || 'License purchase failed');
      }

      // Update generation in state
      setGenerations(prev => prev.map(g => 
        g.id === generation.id ? { ...g, has_license: true } : g
      ));

      // Refresh credits
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: creditsData } = await supabase
          .from('user_credits')
          .select('balance')
          .eq('user_id', user.id)
          .single();
        if (creditsData) setCredits(creditsData.balance);
      }

      addToast('success', locale === 'zh' ? '商用授权购买成功！' : 'Commercial license purchased!');
      
      // Open license page
      window.open(`/${locale}/license/${generation.id}`, '_blank');
    } catch (err: any) {
      console.error('License error:', err);
      addToast('error', err.message || (locale === 'zh' ? '购买失败' : 'Purchase failed'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-24 px-4">
        <FixedUI />
        <div className="max-w-6xl mx-auto">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-24 px-4">
      <FixedUI />
      {/* Back Button */}
      <div className="fixed top-20 left-6 z-40">
        <Link href={`/${locale}`}>
          <button className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all group">
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">{t('title')}</h1>

          <div className="flex items-center space-x-4">
            {/* Credits Display */}
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">{credits}</span>
              <span className="text-gray-400">{t('credits')}</span>
            </div>

            {/* Create Button */}
            <Link
              href={`/${locale}/create`}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              <span>{t('createFirst')}</span>
            </Link>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search')}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          
          {/* Filter by Status */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="all">{locale === 'zh' ? '全部状态' : 'All Status'}</option>
              <option value="COMPLETED">{locale === 'zh' ? '已完成' : 'Completed'}</option>
              <option value="PROCESSING">{locale === 'zh' ? '处理中' : 'Processing'}</option>
              <option value="FAILED">{locale === 'zh' ? '失败' : 'Failed'}</option>
              <option value="PENDING">{locale === 'zh' ? '等待中' : 'Pending'}</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SortDesc className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="newest">{locale === 'zh' ? '最新优先' : 'Newest First'}</option>
              <option value="oldest">{locale === 'zh' ? '最早优先' : 'Oldest First'}</option>
            </select>
          </div>
        </div>

        {/* Models Grid */}
        {generations.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-12 h-12 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">{t('noModels')}</h2>
            <p className="text-gray-400 mb-6">{t('noModelsDesc')}</p>
            <Link
              href={`/${locale}/create`}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              <span>{t('createFirst')}</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {generations
              .filter(gen => {
                const matchesSearch = searchQuery === '' || gen.id.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = statusFilter === 'all' || gen.status === statusFilter;
                return matchesSearch && matchesStatus;
              })
              .sort((a, b) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
              })
              .map((generation) => (
                <div
                  key={generation.id}
                  className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-black/50 relative">
                    {generation.thumbnail_url ? (
                      <LazyImage
                        src={generation.thumbnail_url}
                        alt="Model thumbnail"
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/10 rounded-lg"></div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${generation.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                      generation.status === 'PROCESSING' ? 'bg-yellow-500/20 text-yellow-400' :
                        generation.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                      }`}>
                      {generation.status}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">
                        {new Date(generation.created_at).toLocaleDateString()}
                      </span>
                      {generation.output_format && (
                        <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                          .{generation.output_format}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {generation.mode && (
                        <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded">
                          {generation.mode === 'IMAGE_TO_3D' ? (locale === 'zh' ? '图片' : 'Image') :
                           generation.mode === 'TEXT_TO_3D' ? (locale === 'zh' ? '文字' : 'Text') :
                           generation.mode === 'MULTI_VIEW' ? (locale === 'zh' ? '多视角' : 'Multi') :
                           generation.mode === 'DOODLE' ? (locale === 'zh' ? '涂鸦' : 'Doodle') : generation.mode}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {generation.credits_used} {locale === 'zh' ? '积分' : 'credits'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleDownload(generation)}
                        disabled={generation.status !== 'COMPLETED' || !generation.model_url}
                        className="flex-1 flex items-center justify-center space-x-1 py-2 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4" />
                        <span>{t('download')}</span>
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedGeneration(generation);
                          setShareDialogOpen(true);
                        }}
                        disabled={generation.status !== 'COMPLETED'}
                        className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={locale === 'zh' ? '分享' : 'Share'}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      {generation.has_license ? (
                        <Link href={`/${locale}/license/${generation.id}`} target="_blank">
                          <button 
                            className="p-2 bg-green-500/20 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors"
                            title={locale === 'zh' ? '查看授权' : 'View License'}
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        </Link>
                      ) : (
                        <button 
                          onClick={() => handlePurchaseLicense(generation)}
                          disabled={generation.status !== 'COMPLETED'}
                          className="p-2 bg-white/10 rounded-lg text-yellow-400 hover:bg-yellow-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={locale === 'zh' ? '购买商用授权 (100积分)' : 'Buy Commercial License (100 credits)'}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(generation.id)}
                        disabled={deleting === generation.id}
                        className="p-2 bg-white/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        {deleting === generation.id ? (
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Share Dialog */}
      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => {
          setShareDialogOpen(false);
          setSelectedGeneration(null);
        }}
        generationId={selectedGeneration?.id || ''}
        modelUrl={selectedGeneration?.model_url || undefined}
        onShareComplete={(_platform, creditsEarned) => {
          setCredits(prev => prev + creditsEarned);
        }}
      />

      {/* Floating Free Credits Button - positioned above footer */}
      <div className="fixed bottom-20 right-6 z-40">
        {showFreeCreditsPopup && (
          <div className="absolute bottom-16 right-0 w-80 p-4 bg-zinc-900 border border-green-500/30 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
            <button 
              onClick={() => setShowFreeCreditsPopup(false)}
              className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
            <div className="text-center mb-4">
              <span className="text-2xl">🎁</span>
              <h3 className="text-lg font-bold text-white mt-2">
                {locale === 'zh' ? '免费获取积分' : 'Earn Free Credits'}
              </h3>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-white">{locale === 'zh' ? '邀请好友' : 'Invite Friends'}</div>
                  <div className="text-xs text-gray-400">{locale === 'zh' ? '双方各得积分' : 'Both get credits'}</div>
                </div>
                <div className="text-cyan-400 font-bold">+5</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-white">{locale === 'zh' ? '分享作品' : 'Share Creations'}</div>
                  <div className="text-xs text-gray-400">{locale === 'zh' ? '每日上限20积分' : 'Daily limit: 20'}</div>
                </div>
                <div className="text-purple-400 font-bold">+3~5</div>
              </div>
            </div>
            <Link href={`/${locale}/settings?tab=referrals`}>
              <button className="w-full py-2 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold rounded-lg hover:opacity-90 transition-all text-sm">
                {locale === 'zh' ? '查看我的邀请码' : 'View My Referral Code'}
              </button>
            </Link>
          </div>
        )}
        <button
          onClick={() => setShowFreeCreditsPopup(!showFreeCreditsPopup)}
          className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all ${
            showFreeCreditsPopup 
              ? 'bg-green-500 text-white' 
              : 'bg-gradient-to-r from-green-500 to-cyan-500 text-white hover:shadow-green-500/30 hover:shadow-xl'
          }`}
        >
          <Gift className="w-5 h-5" />
          <span className="font-bold text-sm">{locale === 'zh' ? '免费积分' : 'Free Credits'}</span>
        </button>
      </div>
    </div>
  );
}
