'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';

// Dynamic import for heavy 3D component
const PricingScene = dynamic(() => import('@/components/canvas/PricingScene').then(mod => ({ default: mod.PricingScene })), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-black" />
});

const creditPackages = [
  { id: 'starter', credits: 20, price: 4.99, popular: false, unitPrice: 0.25, savings: null },
  { id: 'basic', credits: 100, price: 14.99, popular: false, unitPrice: 0.15, savings: '40%' },
  { id: 'standard', credits: 300, price: 29.99, popular: true, unitPrice: 0.10, savings: '60%' },
  { id: 'pro', credits: 1000, price: 79.99, popular: false, unitPrice: 0.08, savings: '68%', bestValue: true },
];

const subscriptionPackages = [
  { id: 'proMonthly', credits: 200, price: 19.99, popular: false },
  { id: 'teamMonthly', credits: 500, price: 39.99, popular: true },
];

export default function PricingPage() {
  const t = useTranslations('Pricing');
  const locale = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'credits' | 'subscription'>('credits');
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    setLoadingPackage(packageId);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push(`/${locale}/login?redirect=/pricing`);
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
      }
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setLoadingPackage(null);
    }
  };

  const handleSubscribe = async (packageId: string) => {
    setLoadingPackage(packageId);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push(`/${locale}/login?redirect=/pricing`);
        return;
      }

      // 注意：订阅需要在 Stripe Dashboard 创建价格后获取 stripePriceId
      // 这里暂时提示用户联系客服
      alert('订阅功能即将上线，请先使用积分包购买。\nSubscription coming soon, please use credit packs for now.');
      
      // 实际实现时使用以下代码：
      // const response = await fetch('/api/subscription', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ packageId, stripePriceId: 'price_xxx' }),
      // });
      // const data = await response.json();
      // if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error('Subscribe error:', error);
    } finally {
      setLoadingPackage(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* 3D Background */}
      <PricingScene />

      {/* Navigation */}
      <div className="fixed top-20 left-6 z-40">
        <Link href={`/${locale}`}>
          <button className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all group">
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>

      <div className="relative z-10 pt-32 pb-20 px-6 md:px-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-16">
            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-500 mb-6 tracking-tighter drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]"
            >
              {t('title')}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-300 max-w-2xl mx-auto font-light mb-12"
            >
              {t('subtitle')}
            </motion.p>

            {/* Tab Switcher */}
            <motion.div
              variants={itemVariants}
              className="inline-flex p-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10"
            >
              <button
                onClick={() => setActiveTab('credits')}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'credits'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                {t('tabs.credits')}
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'subscription'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                {t('tabs.subscription')}
              </button>
            </motion.div>

            {/* Discount Banner */}
            <motion.div
              variants={itemVariants}
              className="mt-8"
            >
              <span className="inline-block px-4 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-semibold tracking-wide">
                🎉 {t('firstPurchase')}
              </span>
            </motion.div>
          </div>

          {/* Content Area */}
          <AnimatePresence mode="wait">
            {activeTab === 'credits' ? (
              <motion.section
                key="credits"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="mb-24"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {creditPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`relative p-8 rounded-3xl border transition-all duration-300 group ${pkg.popular
                        ? 'bg-gradient-to-b from-purple-900/40 to-black/60 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]'
                        : 'bg-white/5 backdrop-blur-xl border-white/10 hover:border-cyan-500/50'
                        }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-500 text-white text-xs font-bold rounded-full shadow-lg shadow-purple-500/30">
                          {t('popular')}
                        </div>
                      )}

                      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        {pkg.popular && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
                        {t(`packages.${pkg.id}.name`)}
                      </h3>
                      <p className="text-gray-400 text-sm mb-6 h-10">{t(`packages.${pkg.id}.description`)}</p>

                      <div className="mb-4">
                        <span className="text-4xl font-bold text-white tracking-tight">${pkg.price}</span>
                        {pkg.savings && (
                          <span className="ml-2 text-sm text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded">
                            {t('save')} {pkg.savings}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-8">
                        <div className="text-cyan-400 font-bold text-lg bg-cyan-500/10 py-2 px-4 rounded-lg">
                          {pkg.credits} {t('creditsUnit')}
                        </div>
                        {pkg.bestValue && (
                          <span className="text-xs text-yellow-400 font-bold bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/30">
                            {t('bestValue')}
                          </span>
                        )}
                      </div>

                      <ul className="space-y-4 mb-8">
                        {/* Dynamic Features from JSON */}
                        {[0, 1, 2, 3, 4].map((i) => {
                          const feature = t.raw(`packages.${pkg.id}.features`)[i];
                          if (!feature) return null;
                          return (
                            <li key={i} className="flex items-start text-gray-300 text-sm">
                              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3 mt-0.5 shrink-0">
                                <Check className="w-3 h-3 text-green-400" />
                              </div>
                              {feature}
                            </li>
                          );
                        })}
                      </ul>

                      <button 
                        onClick={() => handlePurchase(pkg.id)}
                        disabled={loadingPackage === pkg.id}
                        className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${pkg.popular
                          ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/30'
                          : 'bg-white/10 text-white hover:bg-white/20 hover:text-cyan-400'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}>
                        {loadingPackage === pkg.id ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                        ) : (
                          t('actions.buyNow')
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.section>
            ) : (
              <motion.section
                key="subscription"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-24"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                  {subscriptionPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`relative p-10 rounded-3xl border transition-all duration-300 ${pkg.popular
                        ? 'bg-gradient-to-b from-cyan-900/40 to-black/60 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)]'
                        : 'bg-white/5 backdrop-blur-xl border-white/10 hover:border-purple-500/50'
                        }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full shadow-lg shadow-cyan-500/30">
                          {t('popular')}
                        </div>
                      )}

                      <h3 className="text-2xl font-bold text-white mb-2">
                        {t(`packages.${pkg.id}.name`)}
                      </h3>
                      <p className="text-gray-400 text-sm mb-6">{t(`packages.${pkg.id}.description`)}</p>

                      <div className="mb-6 flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-white tracking-tight">${pkg.price}</span>
                        <span className="text-gray-400">{t('perMonth')}</span>
                      </div>

                      <div className="text-purple-400 font-bold mb-8 text-lg bg-purple-500/10 py-2 px-4 rounded-lg inline-block">
                        {pkg.credits} {t('creditsUnit')}{t('perMonth')}
                      </div>

                      <ul className="space-y-4 mb-10">
                        {/* Dynamic Features from JSON */}
                        {[0, 1, 2, 3, 4].map((i) => {
                          const feature = t.raw(`packages.${pkg.id}.features`)[i];
                          if (!feature) return null;
                          return (
                            <li key={i} className="flex items-start text-gray-300">
                              <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center mr-3 mt-1 shrink-0">
                                <Check className="w-3 h-3 text-cyan-400" />
                              </div>
                              {feature}
                            </li>
                          );
                        })}
                      </ul>

                      <button 
                        onClick={() => handleSubscribe(pkg.id)}
                        disabled={loadingPackage === pkg.id}
                        className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${pkg.popular
                          ? 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg shadow-cyan-900/30'
                          : 'bg-white/10 text-white hover:bg-white/20 hover:text-purple-400'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}>
                        {loadingPackage === pkg.id ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                        ) : (
                          t('actions.subscribe')
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Generation Costs Info */}
          <motion.div
            variants={itemVariants}
            className="mt-16 p-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl"
          >
            <h3 className="text-xl font-bold text-white mb-8 text-center uppercase tracking-widest">{t('costs.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="p-6 bg-black/20 rounded-2xl border border-white/5">
                <div className="text-4xl font-bold text-cyan-400 mb-2">10</div>
                <div className="text-gray-400 font-mono text-sm">{t('costs.standard')}</div>
              </div>
              <div className="p-6 bg-black/20 rounded-2xl border border-white/5">
                <div className="text-4xl font-bold text-purple-400 mb-2">15</div>
                <div className="text-gray-400 font-mono text-sm">{t('costs.high')}</div>
              </div>
              <div className="p-6 bg-black/20 rounded-2xl border border-white/5">
                <div className="text-4xl font-bold text-pink-400 mb-2">35</div>
                <div className="text-gray-400 font-mono text-sm">{t('costs.ultra')}</div>
              </div>
              <div className="p-6 bg-black/20 rounded-2xl border border-white/5">
                <div className="text-4xl font-bold text-orange-400 mb-2">+15</div>
                <div className="text-gray-400 font-mono text-sm">{t('costs.multiView')}</div>
              </div>
            </div>
          </motion.div>

          {/* Free Credits Promotion Banner */}
          <motion.div
            variants={itemVariants}
            className="mt-12 p-8 bg-gradient-to-r from-green-900/30 via-cyan-900/30 to-purple-900/30 backdrop-blur-md border border-green-500/30 rounded-3xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <span className="inline-block px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-bold mb-3">
                    {locale === 'zh' ? '免费获取积分' : 'FREE CREDITS'}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {locale === 'zh' ? '不想花钱？没问题！' : "Don't want to pay? No problem!"}
                  </h3>
                  <p className="text-gray-400 max-w-lg">
                    {locale === 'zh' 
                      ? '通过邀请好友和分享作品，最多可免费获得 70+ 积分，足够创作多个精美 3D 模型！' 
                      : 'Earn 70+ free credits by inviting friends and sharing creations - enough for multiple stunning 3D models!'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="text-center p-4 bg-black/30 rounded-xl border border-cyan-500/20">
                    <div className="text-3xl font-bold text-cyan-400">+5</div>
                    <div className="text-xs text-gray-400 mt-1">{locale === 'zh' ? '每邀请1人' : 'Per Invite'}</div>
                    <div className="text-xs text-gray-500">{locale === 'zh' ? '最多50积分' : 'Max 50'}</div>
                  </div>
                  <div className="text-center p-4 bg-black/30 rounded-xl border border-purple-500/20">
                    <div className="text-3xl font-bold text-purple-400">+3~5</div>
                    <div className="text-xs text-gray-400 mt-1">{locale === 'zh' ? '每次分享' : 'Per Share'}</div>
                    <div className="text-xs text-gray-500">{locale === 'zh' ? '每日20积分' : '20/day'}</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                <Link href={`/${locale}/signup`}>
                  <button className="px-6 py-2 bg-green-500 text-white font-bold rounded-full hover:bg-green-400 transition-all text-sm">
                    {locale === 'zh' ? '立即注册领 10 积分' : 'Sign Up & Get 10 Credits'}
                  </button>
                </Link>
                <Link href={`/${locale}/settings?tab=referrals`}>
                  <button className="px-6 py-2 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all text-sm border border-white/20">
                    {locale === 'zh' ? '查看我的邀请码' : 'View My Referral Code'}
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
