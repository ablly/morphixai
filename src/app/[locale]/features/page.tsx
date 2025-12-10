'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Eye, FolderOpen, Box, Layers, Palette, Printer, Gamepad2, Film, ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic import for heavy 3D component
const FeaturesScene = dynamic(() => import('@/components/canvas/FeaturesScene').then(mod => ({ default: mod.FeaturesScene })), {
    ssr: false,
    loading: () => <div className="fixed inset-0 -z-10 bg-black" />
});

export default function FeaturesPage() {
    const t = useTranslations('Features');
    const locale = useLocale();

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

    const coreFeatures = [
        {
            icon: Zap,
            titleKey: 'core1_title',
            descKey: 'core1_desc',
            bgColor: 'bg-cyan-500/10',
            iconColor: 'text-cyan-400',
        },
        {
            icon: Eye,
            titleKey: 'core2_title',
            descKey: 'core2_desc',
            bgColor: 'bg-purple-500/10',
            iconColor: 'text-purple-400',
        },
        {
            icon: FolderOpen,
            titleKey: 'core3_title',
            descKey: 'core3_desc',
            bgColor: 'bg-pink-500/10',
            iconColor: 'text-pink-400',
        },
    ];

    const techSpecs = [
        {
            icon: Box,
            titleKey: 'tech1_title',
            descKey: 'tech1_desc',
        },
        {
            icon: Layers,
            titleKey: 'tech2_title',
            descKey: 'tech2_desc',
        },
        {
            icon: Palette,
            titleKey: 'tech3_title',
            descKey: 'tech3_desc',
        },
    ];

    const useCases = [
        {
            icon: Printer,
            titleKey: 'use1_title',
            descKey: 'use1_desc',
            iconColor: 'text-orange-400',
            dotColor: 'bg-orange-400',
        },
        {
            icon: Gamepad2,
            titleKey: 'use2_title',
            descKey: 'use2_desc',
            iconColor: 'text-green-400',
            dotColor: 'bg-green-400',
        },
        {
            icon: Film,
            titleKey: 'use3_title',
            descKey: 'use3_desc',
            iconColor: 'text-blue-400',
            dotColor: 'bg-blue-400',
        },
    ];

    return (
        <div className="min-h-screen bg-transparent relative overflow-hidden">
            {/* 3D Background */}
            <FeaturesScene />

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
                    <div className="text-center mb-32">
                        <motion.h1
                            variants={itemVariants}
                            className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-8 tracking-tighter drop-shadow-[0_0_30px_rgba(0,255,255,0.3)]"
                        >
                            {t('title')}
                        </motion.h1>
                        <motion.p
                            variants={itemVariants}
                            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed"
                        >
                            {t('description')}
                        </motion.p>
                    </div>

                    {/* Core Features */}
                    <section className="mb-32">
                        <motion.h2
                            variants={itemVariants}
                            className="text-3xl md:text-4xl font-bold text-white mb-16 text-center tracking-wide uppercase"
                        >
                            {t('coreFeatures')}
                        </motion.h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {coreFeatures.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                                    className="group p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:border-cyan-500/50 transition-all duration-300"
                                >
                                    <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-8 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all`}>
                                        <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">{t(feature.titleKey)}</h3>
                                    <p className="text-gray-400 leading-relaxed">{t(feature.descKey)}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Tech Specs */}
                    <section className="mb-32">
                        <div className="relative p-12 bg-gradient-to-br from-purple-900/20 to-black/60 backdrop-blur-xl border border-purple-500/20 rounded-3xl overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

                            <motion.h2
                                variants={itemVariants}
                                className="text-3xl md:text-4xl font-bold text-white mb-16 text-center tracking-wide uppercase relative z-10"
                            >
                                {t('techSpecs')}
                            </motion.h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                                {techSpecs.map((spec, index) => (
                                    <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        className="flex flex-col items-center text-center group"
                                    >
                                        <div className="p-4 bg-white/5 rounded-full mb-6 border border-white/10 group-hover:border-purple-500/50 transition-colors">
                                            <spec.icon className="w-10 h-10 text-purple-400 group-hover:text-white transition-colors" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3">{t(spec.titleKey)}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">{t(spec.descKey)}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Export Formats */}
                    <section className="mb-32">
                        <motion.div
                            variants={itemVariants}
                            className="p-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl text-center"
                        >
                            <h2 className="text-2xl font-bold text-white mb-8 uppercase tracking-widest">{t('exportFormats')}</h2>
                            <div className="flex flex-wrap justify-center gap-6">
                                {['GLB', 'OBJ', 'FBX', 'GLTF', 'USDZ'].map((format, index) => (
                                    <motion.div
                                        key={format}
                                        whileHover={{ scale: 1.1, color: '#00ffff', borderColor: '#00ffff' }}
                                        className="px-8 py-4 bg-black/40 border border-white/10 rounded-full text-gray-300 font-mono font-bold text-lg cursor-default transition-all"
                                    >
                                        .{format}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </section>

                    {/* Use Cases */}
                    <section>
                        <motion.h2
                            variants={itemVariants}
                            className="text-3xl md:text-4xl font-bold text-white mb-16 text-center tracking-wide uppercase"
                        >
                            {t('useCases')}
                        </motion.h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {useCases.map((useCase, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{ y: -10 }}
                                    className="p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl hover:border-white/30 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <useCase.icon className={`w-12 h-12 ${useCase.iconColor} group-hover:text-white transition-colors`} />
                                        <div className={`w-2 h-2 rounded-full ${useCase.dotColor} shadow-[0_0_10px_currentColor]`} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">{t(useCase.titleKey)}</h3>
                                    <p className="text-gray-400 leading-relaxed">{t(useCase.descKey)}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </motion.div>
            </div>
        </div>
    );
}
