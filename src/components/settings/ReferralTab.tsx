'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Copy, Gift, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// 社交平台图标组件
const TwitterIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

const FacebookIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

const LinkedInIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
);

const RedditIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
);

const TikTokIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
);

interface ReferralData {
    code: string;
    totalReferrals: number;
    totalCreditsEarned: number;
    history: Array<{ id: string; email: string; credits: number; date: string; }>;
}

export function ReferralTab() {
    const t = useTranslations('Settings.referrals');
    const locale = useLocale();
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ReferralData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase.from('profiles').select('referral_code').eq('id', user.id).single();
            const { data: referrals } = await supabase.from('referrals').select('id, credits_awarded, created_at, referred_id').eq('referrer_id', user.id).order('created_at', { ascending: false });

            setData({
                code: profile?.referral_code || 'LOADING',
                totalReferrals: referrals?.length || 0,
                totalCreditsEarned: referrals?.reduce((sum, r) => sum + r.credits_awarded, 0) || 0,
                history: referrals?.map(r => ({ id: r.id, email: `user_${r.referred_id.slice(0, 6)}...`, credits: r.credits_awarded, date: new Date(r.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US') })) || [],
            });
            setLoading(false);
        };
        fetchData();
    }, [locale]);

    const referralLink = data ? `${typeof window !== 'undefined' ? window.location.origin : ''}/ref/${data.code}` : '';
    const handleCopy = () => { navigator.clipboard.writeText(referralLink); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    const socialPlatforms = [
        { name: 'X', icon: TwitterIcon, color: 'bg-black hover:bg-zinc-800 border-zinc-700', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent('Join Morphix AI and get 25 free credits!')}&url=${encodeURIComponent(referralLink)}` },
        { name: 'Facebook', icon: FacebookIcon, color: 'bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border-[#1877F2]/30 text-[#1877F2]', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}` },
        { name: 'LinkedIn', icon: LinkedInIcon, color: 'bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border-[#0A66C2]/30 text-[#0A66C2]', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}` },
        { name: 'Reddit', icon: RedditIcon, color: 'bg-[#FF4500]/10 hover:bg-[#FF4500]/20 border-[#FF4500]/30 text-[#FF4500]', url: `https://reddit.com/submit?url=${encodeURIComponent(referralLink)}&title=${encodeURIComponent('Check out Morphix AI!')}` },
        { name: 'TikTok', icon: TikTokIcon, color: 'bg-white/10 hover:bg-white/20 border-white/20 text-white', url: referralLink },
    ];

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>;

    const maxReferrals = 10;
    const remainingReferrals = Math.max(0, maxReferrals - (data?.totalReferrals || 0));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">{t('title')}</h2>
                <p className="text-gray-400 text-sm">{t('subtitle', { max: maxReferrals })}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-xl">
                    <p className="text-xs text-purple-300 font-bold uppercase mb-1">{t('totalEarned')}</p>
                    <p className="text-2xl font-bold text-white">{data?.totalCreditsEarned || 0} {t('credits')}</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">{t('friendsInvited')}</p>
                    <p className="text-2xl font-bold text-white">{data?.totalReferrals || 0} / {maxReferrals}</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">{t('remainingInvites')}</p>
                    <p className="text-2xl font-bold text-orange-400">{remainingReferrals}</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">{t('rewardPerInvite')}</p>
                    <p className="text-2xl font-bold text-cyan-400">5 {t('credits')}</p>
                </div>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-pink-500/10 rounded-lg"><Gift className="w-5 h-5 text-pink-400" /></div>
                    <div><h3 className="font-medium text-white">{t('uniqueLink')}</h3><p className="text-xs text-gray-500">{t('shareLinkDesc')}</p></div>
                </div>
                <div className="flex gap-2">
                    <Input value={referralLink} readOnly className="bg-black/20 border-white/10 text-cyan-400 font-mono text-sm" />
                    <Button onClick={handleCopy} className="bg-white/10 hover:bg-white/20 text-white min-w-[100px]">
                        {copied ? <span className="text-green-400">{t('copied')}</span> : <span className="flex items-center gap-2"><Copy className="w-4 h-4" /> {t('copy')}</span>}
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                    {socialPlatforms.map((platform) => (
                        <Button key={platform.name} variant="outline" size="sm" className={`${platform.color} border`} onClick={() => window.open(platform.url, '_blank')}>
                            <platform.icon /> <span className="ml-1">{platform.name}</span>
                        </Button>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <h3 className="font-medium text-white flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" />{t('history')}</h3>
                {data?.history && data.history.length > 0 ? (
                    <div className="space-y-2">
                        {data.history.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                                    <div><p className="text-sm font-medium text-white">{item.email}</p><p className="text-xs text-gray-500">{t('joined')} {item.date}</p></div>
                                </div>
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/20">+{item.credits} {t('credits')}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm text-center py-4">{t('noReferrals')}</p>
                )}
            </div>
        </div>
    );
}
