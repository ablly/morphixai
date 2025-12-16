'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion, useAnimation, Variants } from 'framer-motion';
import { Zap, Eye, Box, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { MorphixLogo } from '@/components/MorphixLogo';

interface LandingOverlayProps {
    loadingComplete: boolean;
}

export function LandingOverlay({ loadingComplete }: LandingOverlayProps) {
    const tHero = useTranslations('Hero');
    const tFeatures = useTranslations('Features');
    const tTech = useTranslations('TechSpecs');
    const tCTA = useTranslations('CTA');
    const locale = useLocale();

    const controls = useAnimation();

    useEffect(() => {
        if (loadingComplete) {
            controls.start('visible');
        }
    }, [loadingComplete, controls]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
                duration: 0.8,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="relative z-10 overflow-x-hidden">
            {/* Section 1: Hero */}
            <section className="w-full h-screen flex items-center justify-start px-6 md:px-20 pointer-events-none select-none relative">
                <motion.div
                    initial="hidden"
                    animate={controls}
                    variants={containerVariants}
                    className="max-w-3xl"
                >
                    <motion.div variants={itemVariants} className="mb-4">
                        <span className="px-3 py-1 border border-cyan-500/30 bg-cyan-500/10 rounded-full text-cyan-400 text-xs font-mono tracking-widest uppercase">
                            System Online v2.0
                        </span>
                    </motion.div>

                    <motion.div variants={itemVariants} className="mb-8">
                        <MorphixLogo className="w-full max-w-[500px] h-auto drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]" />
                        <h1 className="sr-only">{tHero('title')}</h1>
                    </motion.div>
                    <div className="space-y-4">
                        <motion.p
                            variants={itemVariants}
                            className="text-2xl md:text-3xl text-white font-light tracking-widest uppercase"
                        >
                            {tHero('subtitle')}
                        </motion.p>
                        <motion.p
                            variants={itemVariants}
                            className="text-lg md:text-xl text-gray-400 font-light tracking-wide max-w-xl"
                        >
                            {tHero('description')}
                        </motion.p>
                    </div>
                    <motion.div variants={itemVariants} className="mt-10 flex gap-4">
                        <Link href={`/${locale}/create`}>
                            <button className="px-10 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-white hover:text-black transition-all duration-300 pointer-events-auto flex items-center gap-2 group">
                                {tHero('cta')}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                        <Link href={`/${locale}/demo`}>
                            <button className="px-10 py-4 bg-transparent border border-white/20 text-white rounded-full hover:bg-white/10 transition-all duration-300 pointer-events-auto flex items-center gap-2 group">
                                {tHero('demo')}
                                <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Section 2: Features */}
            <section className="w-full min-h-screen flex items-center justify-start px-6 md:px-20 py-20">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl p-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-6">
                        {tFeatures('title')}
                    </h2>
                    <p className="text-lg text-gray-300 leading-relaxed mb-10">
                        {tFeatures('description')}
                    </p>

                    <div className="grid gap-6">
                        <motion.div
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                            className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-cyan-500/50 transition-all group flex items-start gap-4"
                        >
                            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 group-hover:text-cyan-300 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{tFeatures('core1_title')}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{tFeatures('core1_desc')}</p>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                            className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-purple-500/50 transition-all group flex items-start gap-4"
                        >
                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:text-purple-300 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
                                <Eye className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">{tFeatures('core2_title')}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{tFeatures('core2_desc')}</p>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                            className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-pink-500/50 transition-all group flex items-start gap-4"
                        >
                            <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400 group-hover:text-pink-300 group-hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all">
                                <Box className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">{tFeatures('core3_title')}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{tFeatures('core3_desc')}</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Section 3: Tech Specs */}
            <section className="w-full min-h-screen flex items-center justify-end px-6 md:px-20 py-20">
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-xl text-right"
                >
                    <h2 className="text-5xl md:text-7xl font-bold text-white mb-12 tracking-tighter">
                        {tTech('title')}
                    </h2>
                    <ul className="space-y-8">
                        {[
                            { label: tTech('vertex'), color: 'group-hover:text-cyan-400', bg: 'group-hover:bg-cyan-400' },
                            { label: tTech('uv'), color: 'group-hover:text-purple-400', bg: 'group-hover:bg-purple-400' },
                            { label: tTech('pbr'), color: 'group-hover:text-pink-400', bg: 'group-hover:bg-pink-400' },
                            { label: tTech('export'), color: 'group-hover:text-white', bg: 'group-hover:bg-white' }
                        ].map((item, index) => (
                            <motion.li
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-end space-x-6 group cursor-default"
                            >
                                <span className={`text-xl md:text-2xl text-gray-500 ${item.color} transition-colors duration-300 font-light`}>
                                    {item.label}
                                </span>
                                <div className={`w-16 md:w-24 h-[1px] bg-gray-800 ${item.bg} transition-colors duration-300`}></div>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
            </section>

            {/* Section 4: Free Credits */}
            <section className="w-full min-h-[80vh] flex items-center justify-center px-6 md:px-20 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl w-full"
                >
                    <div className="text-center mb-12">
                        <span className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-bold">
                            🎁 {locale === 'zh' ? '免费获取积分' : 'FREE CREDITS'}
                        </span>
                        <h2 className="text-4xl md:text-6xl font-bold text-white mt-6 mb-4">
                            {locale === 'zh' ? '不花钱也能创作' : 'Create Without Paying'}
                        </h2>
                        <p className="text-gray-400 text-lg">
                            {locale === 'zh' ? '通过邀请好友和分享作品，轻松获取免费积分' : 'Earn free credits by inviting friends and sharing your creations'}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* 邀请好友 */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="p-8 bg-gradient-to-br from-cyan-900/30 to-black/50 border border-cyan-500/30 rounded-3xl"
                        >
                            <div className="text-5xl mb-4">👥</div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {locale === 'zh' ? '邀请好友' : 'Invite Friends'}
                            </h3>
                            <p className="text-gray-400 mb-4">
                                {locale === 'zh' ? '每邀请1位好友注册，双方各得' : 'Both you and your friend get'}
                            </p>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-bold text-cyan-400">+5</span>
                                <span className="text-gray-400">{locale === 'zh' ? '积分' : 'Credits'}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                                {locale === 'zh' ? '最多邀请 10 人，上限 50 积分' : 'Max 10 invites, up to 50 credits'}
                            </div>
                        </motion.div>

                        {/* 分享作品 */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="p-8 bg-gradient-to-br from-purple-900/30 to-black/50 border border-purple-500/30 rounded-3xl"
                        >
                            <div className="text-5xl mb-4">📤</div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {locale === 'zh' ? '分享作品' : 'Share Creations'}
                            </h3>
                            <p className="text-gray-400 mb-4">
                                {locale === 'zh' ? '分享你的 3D 模型到社交媒体' : 'Share your 3D models on social media'}
                            </p>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-bold text-purple-400">+3~5</span>
                                <span className="text-gray-400">{locale === 'zh' ? '积分/次' : 'Credits each'}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                                {locale === 'zh' ? '每日上限 20 积分' : 'Daily limit: 20 credits'}
                            </div>
                        </motion.div>
                    </div>

                    <div className="text-center mt-8">
                        <Link href={`/${locale}/signup`}>
                            <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-full hover:opacity-90 transition-all">
                                {locale === 'zh' ? '立即注册，领取 10 积分' : 'Sign Up Now, Get 10 Free Credits'}
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Section 5: CTA */}
            <section className="w-full min-h-screen flex flex-col items-center justify-center space-y-24 py-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="text-center px-4"
                >
                    <h2 className="text-5xl md:text-8xl font-bold text-white mb-10 tracking-tighter text-center drop-shadow-2xl">
                        {tCTA('title')}
                    </h2>
                    <Link href={`/${locale}/create`}>
                        <button className="px-12 py-5 bg-white text-black font-bold text-xl rounded-full hover:bg-cyan-400 hover:scale-105 transition-all duration-300 shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                            {tCTA('button')}
                        </button>
                    </Link>
                </motion.div>
            </section>

            {/* Footer Badges */}
            <section className="w-full py-12 flex justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap gap-4 justify-center items-center"
                >
                    <a 
                        href="https://www.nxgntools.com/tools/morphix-ai?utm_source=morphix-ai" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <img 
                            src="https://www.nxgntools.com/api/embed/morphix-ai?type=FEATURED_ON" 
                            alt="Featured on NextGen Tools" 
                            className="h-10"
                        />
                    </a>
                </motion.div>
            </section>
        </div>
    );
}
