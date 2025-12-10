'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, Globe, ArrowLeft, Mail, Twitter } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic import for heavy 3D component
const AboutScene3D = dynamic(() => import('@/components/canvas/AboutScene').then(mod => ({
    default: () => {
        const { Canvas } = require('@react-three/fiber');
        const { Suspense } = require('react');
        const { AboutScene } = mod;
        return (
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <Suspense fallback={null}>
                    <color attach="background" args={['#050510']} />
                    <AboutScene />
                </Suspense>
            </Canvas>
        );
    }
})), {
    ssr: false,
    loading: () => <div className="fixed inset-0 -z-10 bg-black" />
});

export default function AboutPage() {
    const t = useTranslations('About');
    const locale = useLocale();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut" as const
            }
        }
    };

    const values = [
        { icon: Sparkles, key: 'v1' },
        { icon: Zap, key: 'v2' },
        { icon: Shield, key: 'v3' },
        { icon: Globe, key: 'v4' },
    ];

    return (
        <div className="min-h-screen bg-transparent relative overflow-hidden">
            {/* 3D Background */}
            <div className="fixed inset-0 -z-10 bg-black">
                <AboutScene3D />
            </div>

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
                    className="max-w-5xl mx-auto"
                >
                    {/* Hero */}
                    <div className="text-center mb-32">
                        <motion.div variants={itemVariants} className="inline-block mb-4 px-4 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                            <span className="text-cyan-400 text-sm font-mono tracking-widest uppercase">Mission Status: Active</span>
                        </motion.div>
                        <motion.h1
                            variants={itemVariants}
                            className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 mb-8 tracking-tighter"
                        >
                            {t('hero.title')}
                        </motion.h1>
                        <motion.p
                            variants={itemVariants}
                            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed"
                        >
                            {t('hero.subtitle')}
                        </motion.p>
                    </div>

                    {/* Story Section */}
                    <motion.section variants={itemVariants} className="mb-32 relative">
                        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-cyan-500 via-purple-500 to-transparent opacity-30 rounded-full" />
                        <div className="pl-8 md:pl-12">
                            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
                                <span className="w-12 h-[1px] bg-cyan-500" />
                                {t('story.title')}
                            </h2>
                            <div className="space-y-6 text-lg text-gray-300 leading-relaxed max-w-3xl">
                                <p className="backdrop-blur-sm bg-black/20 p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                                    {t('story.p1')}
                                </p>
                                <p className="backdrop-blur-sm bg-black/20 p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-colors">
                                    {t('story.p2')}
                                </p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Values Grid */}
                    <motion.section variants={itemVariants} className="mb-32">
                        <h2 className="text-3xl font-bold text-white mb-12 text-center tracking-wide uppercase">
                            {t('values.title')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {values.map((value, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                    className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl group transition-all duration-300"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-all">
                                        <value.icon className="w-7 h-7 text-cyan-400 group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{t(`values.${value.key}_title`)}</h3>
                                    <p className="text-gray-400 leading-relaxed">{t(`values.${value.key}_desc`)}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Contact Section */}
                    <motion.section variants={itemVariants} className="text-center">
                        <div className="p-12 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl backdrop-blur-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-cyan-500/5 blur-3xl" />
                            <div className="relative z-10">
                                <h2 className="text-3xl font-bold text-white mb-4">
                                    {t('contact.title')}
                                </h2>
                                <p className="text-gray-400 mb-10 max-w-xl mx-auto">
                                    {t('contact.subtitle')}
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                    <a
                                        href="mailto:zqhablly@gmail.com"
                                        className="group flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all w-full sm:w-auto justify-center"
                                    >
                                        <Mail className="w-5 h-5 text-cyan-400 group-hover:text-white transition-colors" />
                                        <span className="text-white font-medium">zqhablly@gmail.com</span>
                                    </a>
                                    <a
                                        href="mailto:3533912007@qq.com"
                                        className="group flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all w-full sm:w-auto justify-center"
                                    >
                                        <Twitter className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors" />
                                        <span className="text-white font-medium">3533912007@qq.com</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </motion.div>
            </div>
        </div>
    );
}
