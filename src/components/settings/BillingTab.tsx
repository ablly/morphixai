'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check, Clock, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Transaction {
    id: string;
    type: string;
    amount: number;
    description: string;
    created_at: string;
}

interface Subscription {
    id: string;
    status: string;
    package_name: string;
    current_period_end: string;
}

export function BillingTab() {
    const t = useTranslations('Settings.billing');
    const locale = useLocale();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 获取购买交易记录
            const { data: txData } = await supabase
                .from('credit_transactions')
                .select('*')
                .eq('user_id', user.id)
                .in('type', ['PURCHASE', 'SUBSCRIPTION'])
                .order('created_at', { ascending: false })
                .limit(10);

            if (txData) setTransactions(txData);

            // 获取订阅状态
            const { data: subData } = await supabase
                .from('subscriptions')
                .select('*, credit_packages(name)')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single();

            if (subData) {
                setSubscription({
                    id: subData.id,
                    status: subData.status,
                    package_name: subData.credit_packages?.name || 'Pro',
                    current_period_end: subData.current_period_end,
                });
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">{t('title')}</h2>
                <p className="text-gray-400 text-sm">{t('subtitle')}</p>
            </div>

            {/* Current Plan */}
            <div className="p-6 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/20 rounded-2xl relative overflow-hidden">
                <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-full border border-cyan-500/20">
                        {t('active')}
                    </span>
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{t('currentPlan')}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-bold text-white">
                        {subscription ? subscription.package_name : t('freePlan')}
                    </span>
                    <span className="text-gray-500">/ {subscription ? formatDate(subscription.current_period_end) : t('forever')}</span>
                </div>
                <div className="flex gap-4">
                    <Button 
                        onClick={() => router.push(`/${locale}/pricing`)}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
                    >
                        {t('upgrade')}
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => router.push(`/${locale}/pricing`)}
                        className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
                    >
                        {t('manage')}
                    </Button>
                </div>
            </div>

            {/* Invoice History */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                        <Clock className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="font-medium text-white">{t('invoices')}</h3>
                </div>

                {transactions.length > 0 ? (
                    <div className="space-y-2">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                                        <Check className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{tx.description}</p>
                                        <p className="text-xs text-gray-500">{formatDate(tx.created_at)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-white">+{tx.amount} {t('credits') || 'Credits'}</p>
                                    <p className="text-xs text-cyan-400">{t('paid')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm text-center py-8">{t('noInvoices')}</p>
                )}
            </div>
        </div>
    );
}
