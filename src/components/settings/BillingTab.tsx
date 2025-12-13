'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
    CreditCard, Clock, Loader2, TrendingUp, TrendingDown, 
    Gift, Download, Sparkles, Users, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Transaction {
    id: string;
    type: string;
    amount: number;
    balance_after: number;
    description: string;
    created_at: string;
}

interface UserCredits {
    balance: number;
    total_earned: number;
    total_spent: number;
}

export function BillingTab() {
    const t = useTranslations('Settings.billing');
    const locale = useLocale();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [credits, setCredits] = useState<UserCredits | null>(null);
    const [planTier, setPlanTier] = useState<string>('free');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    useEffect(() => {
        fetchData();
    }, [page]);

    const fetchData = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 获取用户积分信息
        const { data: creditsData } = await supabase
            .from('user_credits')
            .select('balance, total_earned, total_spent')
            .eq('user_id', user.id)
            .single();
        if (creditsData) setCredits(creditsData);

        // 获取用户套餐
        const { data: profileData } = await supabase
            .from('profiles')
            .select('plan_tier')
            .eq('id', user.id)
            .single();
        if (profileData) setPlanTier(profileData.plan_tier || 'free');

        // 获取所有交易记录（分页）
        const { data: txData, count } = await supabase
            .from('credit_transactions')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (txData) setTransactions(txData);
        if (count) setTotalPages(Math.ceil(count / limit));

        setLoading(false);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'PURCHASE': return <CreditCard className="w-4 h-4" />;
            case 'GENERATION': return <Sparkles className="w-4 h-4" />;
            case 'REFERRAL': return <Users className="w-4 h-4" />;
            case 'WELCOME': return <Gift className="w-4 h-4" />;
            default: return <Download className="w-4 h-4" />;
        }
    };

    const getTransactionColor = (type: string, amount: number) => {
        if (amount > 0) return 'text-green-400 bg-green-500/10';
        return 'text-red-400 bg-red-500/10';
    };

    const getTransactionLabel = (type: string) => {
        const labels: Record<string, string> = {
            PURCHASE: locale === 'zh' ? '购买积分' : 'Purchase',
            GENERATION: locale === 'zh' ? '生成消耗' : 'Generation',
            REFERRAL: locale === 'zh' ? '邀请奖励' : 'Referral',
            WELCOME: locale === 'zh' ? '注册奖励' : 'Welcome Bonus',
            SUBSCRIPTION: locale === 'zh' ? '订阅' : 'Subscription',
            REFUND: locale === 'zh' ? '退款' : 'Refund',
        };
        return labels[type] || type;
    };

    const getPlanName = (tier: string) => {
        const names: Record<string, string> = {
            free: locale === 'zh' ? '免费套餐' : 'Free Plan',
            starter: locale === 'zh' ? '体验版' : 'Starter',
            creator: locale === 'zh' ? '创作者版' : 'Creator',
            pro: locale === 'zh' ? '专业版' : 'Pro',
        };
        return names[tier] || tier;
    };

    if (loading && page === 1) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">{t('title')}</h2>
                <p className="text-gray-400 text-sm">{t('subtitle')}</p>
            </div>

            {/* Current Plan & Credits Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Plan */}
                <div className="p-6 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/20 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                            {locale === 'zh' ? '当前套餐' : 'Current Plan'}
                        </h3>
                        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-full">
                            {locale === 'zh' ? '生效中' : 'Active'}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-white mb-4">{getPlanName(planTier)}</p>
                    <Button 
                        onClick={() => router.push(`/${locale}/pricing`)}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
                    >
                        {locale === 'zh' ? '升级套餐' : 'Upgrade'}
                    </Button>
                </div>

                {/* Credits Overview */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                        {locale === 'zh' ? '积分概览' : 'Credits Overview'}
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">{locale === 'zh' ? '当前余额' : 'Balance'}</span>
                            <span className="text-2xl font-bold text-cyan-400">{credits?.balance || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-green-400" />
                                {locale === 'zh' ? '总获得' : 'Total Earned'}
                            </span>
                            <span className="text-green-400">+{credits?.total_earned || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 flex items-center gap-1">
                                <TrendingDown className="w-3 h-3 text-red-400" />
                                {locale === 'zh' ? '总消耗' : 'Total Spent'}
                            </span>
                            <span className="text-red-400">-{credits?.total_spent || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="font-medium text-white">
                        {locale === 'zh' ? '交易记录' : 'Transaction History'}
                    </h3>
                </div>

                {transactions.length > 0 ? (
                    <>
                        <div className="space-y-2">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionColor(tx.type, tx.amount)}`}>
                                            {getTransactionIcon(tx.type)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-white">{tx.description}</p>
                                                <span className="px-2 py-0.5 text-xs bg-white/10 rounded text-gray-400">
                                                    {getTransactionLabel(tx.type)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">{formatDate(tx.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {locale === 'zh' ? '余额' : 'Balance'}: {tx.balance_after}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                                <p className="text-sm text-gray-500">
                                    {locale === 'zh' ? `第 ${page} / ${totalPages} 页` : `Page ${page} of ${totalPages}`}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1 || loading}
                                        className="border-white/10"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages || loading}
                                        className="border-white/10"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500">
                            {locale === 'zh' ? '暂无交易记录' : 'No transactions yet'}
                        </p>
                        <Button 
                            onClick={() => router.push(`/${locale}/pricing`)}
                            className="mt-4 bg-cyan-500 hover:bg-cyan-400 text-black"
                        >
                            {locale === 'zh' ? '购买积分' : 'Buy Credits'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
