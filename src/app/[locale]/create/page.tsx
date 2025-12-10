'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FixedUI } from '@/components/FixedUI';
import { ImageUploader } from '@/components/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Layers, Sparkles, Wand2, ArrowLeft, Terminal, Type, FileBox,
    Download, AlertCircle, Image, Images, Pencil, Check, X,
    ChevronLeft, ChevronRight, Sun, RotateCcw, Grid3X3, Eye, Settings2
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { createClient } from '@/lib/supabase/client';
import { GENERATION_COSTS, ADVANCED_OPTIONS_COSTS } from '@/lib/credits/constants';

const Viewer3D = dynamic(() => import('@/components/canvas/Viewer3D').then(mod => ({ default: mod.Viewer3D })), {
    ssr: false,
});

type GenerationMode = 'IMAGE_TO_3D' | 'TEXT_TO_3D' | 'MULTI_VIEW' | 'DOODLE';

export default function CreatePage() {
    const t = useTranslations('Create');
    const locale = useLocale();
    const router = useRouter();

    // Panel State
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Generation State
    const [mode, setMode] = useState<GenerationMode>('IMAGE_TO_3D');
    const [file, setFile] = useState<File | null>(null);
    const [multiFiles, setMultiFiles] = useState<File[]>([]);
    const [textPrompt, setTextPrompt] = useState('');
    const [quality, setQuality] = useState<'standard' | 'high' | 'ultra'>('standard');
    const [format, setFormat] = useState<'glb' | 'obj' | 'fbx' | 'usdz' | 'stl'>('glb');
    const [isGenerating, setIsGenerating] = useState(false);
    const [modelUrl, setModelUrl] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [credits, setCredits] = useState<number>(0);
    const [generationId, setGenerationId] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [progressStage, setProgressStage] = useState('');

    // Advanced Options
    const [hdTexture, setHdTexture] = useState(false);
    const [pbrMaterial, setPbrMaterial] = useState(false);
    const [rigging, setRigging] = useState(false);
    const [lowPoly, setLowPoly] = useState(false);
    const [partSegment, setPartSegment] = useState(false);

    // Viewer State
    const [intensity, setIntensity] = useState(1.5);
    const [autoRotate, setAutoRotate] = useState(true);
    const [showGrid, setShowGrid] = useState(true);
    const [showTerminal, setShowTerminal] = useState(false);

    // Calculate cost
    const calculateCost = useCallback(() => {
        let baseCost = 0;
        switch (mode) {
            case 'IMAGE_TO_3D':
                baseCost = quality === 'standard' ? GENERATION_COSTS.STANDARD
                    : quality === 'high' ? GENERATION_COSTS.HIGH : GENERATION_COSTS.ULTRA;
                break;
            case 'TEXT_TO_3D': baseCost = GENERATION_COSTS.TEXT_TO_3D; break;
            case 'MULTI_VIEW': baseCost = GENERATION_COSTS.MULTI_VIEW; break;
            case 'DOODLE': baseCost = GENERATION_COSTS.DOODLE; break;
        }
        let optionsCost = 0;
        if (hdTexture) optionsCost += ADVANCED_OPTIONS_COSTS.HD_TEXTURE;
        if (pbrMaterial) optionsCost += ADVANCED_OPTIONS_COSTS.PBR_MATERIAL;
        if (rigging) optionsCost += ADVANCED_OPTIONS_COSTS.RIGGING;
        if (lowPoly) optionsCost += ADVANCED_OPTIONS_COSTS.LOW_POLY;
        if (partSegment) optionsCost += ADVANCED_OPTIONS_COSTS.PART_SEGMENT;
        return baseCost + optionsCost;
    }, [mode, quality, hdTexture, pbrMaterial, rigging, lowPoly, partSegment]);

    const creditsRequired = calculateCost();


    // Fetch credits
    useEffect(() => {
        const fetchCredits = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push(`/${locale}/login`); return; }
            const { data } = await supabase.from('user_credits').select('balance').eq('user_id', user.id).single();
            if (data) setCredits(data.balance);
        };
        fetchCredits();
    }, [router, locale]);

    // Poll generation status
    useEffect(() => {
        if (!generationId || !isGenerating) return;
        const stages = [
            { progress: 10, stage: locale === 'zh' ? '分析输入...' : 'Analyzing...' },
            { progress: 30, stage: locale === 'zh' ? '生成网格...' : 'Generating mesh...' },
            { progress: 50, stage: locale === 'zh' ? '优化拓扑...' : 'Optimizing...' },
            { progress: 70, stage: locale === 'zh' ? '应用纹理...' : 'Texturing...' },
            { progress: 90, stage: locale === 'zh' ? '最终处理...' : 'Finalizing...' },
        ];
        let idx = 0;
        const progressInterval = setInterval(() => {
            if (idx < stages.length) {
                setProgress(stages[idx].progress);
                setProgressStage(stages[idx].stage);
                setLogs(prev => [...prev, `> ${stages[idx].stage}`]);
                idx++;
            }
        }, 2500);

        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/generate?id=${generationId}`);
                const data = await res.json();
                if (data.status === 'COMPLETED') {
                    clearInterval(progressInterval);
                    setProgress(100);
                    setProgressStage(locale === 'zh' ? '完成!' : 'Done!');
                    setIsGenerating(false);
                    setModelUrl(data.model_url);
                    setLogs(prev => [...prev, '> ✓ COMPLETE']);
                    setGenerationId(null);
                } else if (data.status === 'FAILED') {
                    clearInterval(progressInterval);
                    setIsGenerating(false);
                    setError(data.error_message || 'Failed');
                    setLogs(prev => [...prev, `> ✗ ${data.error_message}`]);
                    setGenerationId(null);
                }
            } catch (e) { console.error(e); }
        }, 2000);

        return () => { clearInterval(pollInterval); clearInterval(progressInterval); };
    }, [generationId, isGenerating, locale]);

    const isInputValid = () => {
        switch (mode) {
            case 'TEXT_TO_3D': return textPrompt.trim().length > 0;
            case 'IMAGE_TO_3D': case 'DOODLE': return file !== null;
            case 'MULTI_VIEW': return multiFiles.length >= 2;
            default: return false;
        }
    };

    const handleGenerate = async () => {
        if (!isInputValid()) return;
        setIsGenerating(true); setLogs([]); setModelUrl(null); setError(null);
        if (credits < creditsRequired) { setError(t('insufficientCredits')); setIsGenerating(false); return; }
        setLogs(['> Initializing...']);

        try {
            const formData = new FormData();
            formData.append('mode', mode);
            if (file) formData.append('file', file);
            if (textPrompt) formData.append('textPrompt', textPrompt);
            multiFiles.forEach(f => formData.append('files', f));
            formData.append('quality', quality);
            formData.append('format', format);
            formData.append('hdTexture', hdTexture.toString());
            formData.append('pbrMaterial', pbrMaterial.toString());
            formData.append('rigging', rigging.toString());
            formData.append('lowPoly', lowPoly.toString());
            formData.append('partSegment', partSegment.toString());

            const res = await fetch('/api/generate', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            setGenerationId(data.generationId);
            setCredits(data.newBalance);
            setLogs(prev => [...prev, `> -${data.creditsUsed} credits`]);
        } catch (err: any) {
            setIsGenerating(false);
            setError(err.message);
            setLogs(prev => [...prev, `> ERROR: ${err.message}`]);
        }
    };

    const handleDownload = () => {
        if (!modelUrl) return;
        const link = document.createElement('a');
        link.href = modelUrl;
        link.download = `morphix-model.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const modeConfig = [
        { id: 'IMAGE_TO_3D', icon: Image, label: locale === 'zh' ? '单图' : 'Image', cost: GENERATION_COSTS.STANDARD },
        { id: 'TEXT_TO_3D', icon: Type, label: locale === 'zh' ? '文字' : 'Text', cost: GENERATION_COSTS.TEXT_TO_3D },
        { id: 'MULTI_VIEW', icon: Images, label: locale === 'zh' ? '多视角' : 'Multi', cost: GENERATION_COSTS.MULTI_VIEW },
        { id: 'DOODLE', icon: Pencil, label: locale === 'zh' ? '涂鸦' : 'Doodle', cost: GENERATION_COSTS.DOODLE },
    ];

    const advancedOptions = [
        { id: 'hdTexture', label: t('advancedOptions.hdTexture'), cost: ADVANCED_OPTIONS_COSTS.HD_TEXTURE, state: hdTexture, set: setHdTexture },
        { id: 'pbrMaterial', label: t('advancedOptions.pbrMaterial'), cost: ADVANCED_OPTIONS_COSTS.PBR_MATERIAL, state: pbrMaterial, set: setPbrMaterial },
        { id: 'rigging', label: t('advancedOptions.rigging'), cost: ADVANCED_OPTIONS_COSTS.RIGGING, state: rigging, set: setRigging },
        { id: 'lowPoly', label: t('advancedOptions.lowPoly'), cost: ADVANCED_OPTIONS_COSTS.LOW_POLY, state: lowPoly, set: setLowPoly },
        { id: 'partSegment', label: t('advancedOptions.partSegment'), cost: ADVANCED_OPTIONS_COSTS.PART_SEGMENT, state: partSegment, set: setPartSegment },
    ];


    return (
        <div className="fixed inset-0 bg-black overflow-hidden">
            <FixedUI />

            {/* ═══════════════════════════════════════════════════════════════
                FULL-SCREEN 3D CANVAS BACKGROUND
            ═══════════════════════════════════════════════════════════════ */}
            <div className="absolute inset-0 z-0">
                <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2, 6], fov: 45 }}>
                    <color attach="background" args={['#030303']} />
                    {modelUrl ? (
                        <Viewer3D
                            modelUrl={modelUrl}
                            mode="solid"
                            intensity={intensity}
                            autoRotate={autoRotate}
                            showGrid={showGrid}
                        />
                    ) : (
                        <>
                            <ambientLight intensity={0.2} />
                            <pointLight position={[10, 10, 10]} intensity={0.5} color="#22d3ee" />
                            <pointLight position={[-10, -10, -10]} intensity={0.3} color="#a855f7" />
                            {showGrid && (
                                <gridHelper args={[20, 20, '#1a1a2e', '#0a0a15']} position={[0, -1, 0]} />
                            )}
                            <mesh rotation={[0, 0, 0]} scale={1.5}>
                                <icosahedronGeometry args={[1, 1]} />
                                <meshStandardMaterial color="#111" wireframe opacity={0.3} transparent />
                            </mesh>
                        </>
                    )}
                </Canvas>
                <Loader
                    containerStyles={{ background: 'transparent' }}
                    innerStyles={{ background: 'rgba(34, 211, 238, 0.1)', width: '200px', height: '2px' }}
                    barStyles={{ background: '#22d3ee', height: '2px' }}
                    dataStyles={{ color: '#22d3ee', fontSize: '10px', fontFamily: 'monospace' }}
                />
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                LOADING OVERLAY
            ═══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
                    >
                        <div className="relative w-32 h-32 mb-8">
                            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
                            <div className="absolute inset-2 rounded-full border-2 border-purple-500/30 animate-pulse" />
                            <div className="absolute inset-4 rounded-full border border-cyan-400/50 animate-spin" style={{ animationDuration: '3s' }} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-mono text-cyan-400">{progress}%</span>
                            </div>
                        </div>
                        <p className="text-cyan-400 font-mono text-sm tracking-wider">{progressStage}</p>
                        <div className="w-64 h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════════════════════════════
                BACK BUTTON (Top Left)
            ═══════════════════════════════════════════════════════════════ */}
            <Link href={`/${locale}`} className="absolute top-6 left-6 z-30">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-white/70 hover:text-white hover:border-cyan-500/50 transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </motion.button>
            </Link>

            {/* ═══════════════════════════════════════════════════════════════
                CREDITS DISPLAY (Top Right)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
                <div className="px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className={`font-mono text-sm ${credits < 10 ? 'text-red-400' : 'text-white'}`}>
                        {credits}
                    </span>
                </div>
            </div>


            {/* ═══════════════════════════════════════════════════════════════
                FLOATING COMMAND PANEL (Left Side)
            ═══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {isPanelOpen && (
                    <motion.div
                        initial={{ x: -400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -400, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute top-20 left-4 bottom-20 w-96 z-30 flex flex-col"
                    >
                        <div className="flex-1 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.8)]">
                            {/* Panel Header */}
                            <div className="p-5 border-b border-white/5">
                                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                                    {t('station')}
                                </h2>
                                <p className="text-xs text-gray-500 font-mono mt-1">{t('version')}</p>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                                {/* Mode Selection */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        {t('modes.title')}
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {modeConfig.map(({ id, icon: Icon, label }) => (
                                            <button
                                                key={id}
                                                onClick={() => setMode(id as GenerationMode)}
                                                className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 ${
                                                    mode === id
                                                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                                                        : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'
                                                }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="text-xs font-medium">{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic Input */}
                                <div className="space-y-3">
                                    {mode === 'TEXT_TO_3D' && (
                                        <>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <Type className="w-4 h-4 text-cyan-400" />
                                                {t('textPrompt')}
                                            </label>
                                            <textarea
                                                placeholder={t('textPlaceholder')}
                                                value={textPrompt}
                                                onChange={(e) => setTextPrompt(e.target.value)}
                                                rows={3}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none"
                                            />
                                        </>
                                    )}

                                    {(mode === 'IMAGE_TO_3D' || mode === 'DOODLE') && (
                                        <>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-purple-400" />
                                                {mode === 'DOODLE' ? t('doodleImage') : t('referenceImage')}
                                            </label>
                                            <ImageUploader onFileSelect={setFile} />
                                        </>
                                    )}

                                    {mode === 'MULTI_VIEW' && (
                                        <>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <Images className="w-4 h-4 text-purple-400" />
                                                {t('multiViewUpload')}
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                                    <div key={i} className="relative aspect-square">
                                                        <input type="file" accept="image/*" className="hidden" id={`mv-${i}`}
                                                            onChange={(e) => {
                                                                const f = e.target.files?.[0];
                                                                if (f) { const nf = [...multiFiles]; nf[i] = f; setMultiFiles(nf.filter(Boolean)); }
                                                            }}
                                                        />
                                                        <label htmlFor={`mv-${i}`}
                                                            className={`block w-full h-full rounded-xl border-2 border-dashed cursor-pointer flex items-center justify-center transition-all ${
                                                                multiFiles[i] ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-white/10 hover:border-white/20'
                                                            }`}
                                                        >
                                                            {multiFiles[i] ? (
                                                                <div className="relative w-full h-full">
                                                                    <img src={URL.createObjectURL(multiFiles[i])} className="w-full h-full object-cover rounded-xl" alt="" />
                                                                    <button onClick={(e) => { e.preventDefault(); setMultiFiles(multiFiles.filter((_, j) => j !== i)); }}
                                                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                                                        <X className="w-3 h-3 text-white" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-500 text-sm">{i + 1}</span>
                                                            )}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500">{multiFiles.length}/6 {locale === 'zh' ? '已选' : 'selected'}</p>
                                        </>
                                    )}
                                </div>

                                {/* Quality (Image mode only) */}
                                {mode === 'IMAGE_TO_3D' && (
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            {t('quality')}
                                        </label>
                                        <div className="flex gap-1 p-1.5 bg-white/5 rounded-xl">
                                            {(['standard', 'high', 'ultra'] as const).map((q) => (
                                                <button key={q} onClick={() => setQuality(q)}
                                                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                                                        quality === q
                                                            ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-cyan-400'
                                                            : 'text-gray-500 hover:text-gray-300'
                                                    }`}
                                                >
                                                    {t(`qualities.${q}`)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Format */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        {t('format')}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {(['glb', 'obj', 'fbx', 'usdz', 'stl'] as const).map((f) => (
                                            <button key={f} onClick={() => setFormat(f)}
                                                className={`px-4 py-2 rounded-lg text-sm font-mono transition-all border ${
                                                    format === f
                                                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                                                        : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                                                }`}
                                            >
                                                .{f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Advanced Options Toggle */}
                                <button onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-300 transition-colors py-3"
                                >
                                    <span className="uppercase tracking-wider font-bold">{t('advancedOptions.title')}</span>
                                    <motion.div animate={{ rotate: showAdvanced ? 180 : 0 }}>
                                        <ChevronRight className="w-4 h-4 rotate-90" />
                                    </motion.div>
                                </button>

                                <AnimatePresence>
                                    {showAdvanced && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="space-y-2 overflow-hidden"
                                        >
                                            {advancedOptions.map(({ id, label, cost, state, set }) => (
                                                <button key={id} onClick={() => set(!state)}
                                                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                                                        state
                                                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                                                            : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                                                            state ? 'bg-cyan-500 border-cyan-500' : 'border-white/20'
                                                        }`}>
                                                            {state && <Check className="w-3 h-3 text-black" />}
                                                        </div>
                                                        <span className="text-sm">{label}</span>
                                                    </div>
                                                    <span className="text-xs opacity-60">+{cost}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Footer - Cost & Generate */}
                            <div className="p-5 border-t border-white/5 space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">{t('cost')}</span>
                                    <span className="font-mono text-cyan-400 font-bold text-lg">{creditsRequired} {locale === 'zh' ? '积分' : 'credits'}</span>
                                </div>

                                {credits < creditsRequired && (
                                    <Link href={`/${locale}/pricing`}>
                                        <button className="w-full py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm hover:bg-yellow-500/20 transition-colors">
                                            {t('lowCredits')}
                                        </button>
                                    </Link>
                                )}

                                <Button
                                    onClick={handleGenerate}
                                    disabled={!isInputValid() || isGenerating || credits < creditsRequired}
                                    className={`w-full py-6 text-base font-bold rounded-xl transition-all ${
                                        !isInputValid() || isGenerating || credits < creditsRequired
                                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-[0_0_30px_rgba(34,211,238,0.3)]'
                                    }`}
                                >
                                    {isGenerating ? (
                                        <span className="flex items-center gap-2">
                                            <Wand2 className="w-5 h-5 animate-spin" />
                                            {t('generating')}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Zap className="w-5 h-5" />
                                            {t('generate')}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Panel Toggle Button */}
            <motion.button
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className="absolute top-1/2 -translate-y-1/2 z-30 p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-white/50 hover:text-white transition-all"
                animate={{ left: isPanelOpen ? 408 : 24 }}
            >
                {isPanelOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </motion.button>


            {/* ═══════════════════════════════════════════════════════════════
                FLOATING VIEWPORT CONTROLS (Bottom Right)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full">
                    <button
                        onClick={() => setAutoRotate(!autoRotate)}
                        className={`p-2 rounded-full transition-all ${autoRotate ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-white'}`}
                        title="Auto Rotate"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`p-2 rounded-full transition-all ${showGrid ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-white'}`}
                        title="Grid"
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-1 px-2">
                        <Sun className="w-3 h-3 text-gray-500" />
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={intensity}
                            onChange={(e) => setIntensity(parseFloat(e.target.value))}
                            className="w-16 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400"
                        />
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                DOWNLOAD BUTTON (Bottom Center) - Shows when model ready
            ═══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {modelUrl && !isGenerating && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30"
                    >
                        <Button
                            onClick={handleDownload}
                            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold rounded-full shadow-[0_0_40px_rgba(34,211,238,0.4)] flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            {t('downloadBtn')} .{format.toUpperCase()}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════════════════════════════
                TERMINAL LOG (Bottom Left) - Collapsible
            ═══════════════════════════════════════════════════════════════ */}
            <div className="absolute bottom-6 left-6 z-20" style={{ left: isPanelOpen ? 350 : 24 }}>
                <motion.button
                    onClick={() => setShowTerminal(!showTerminal)}
                    className="p-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-gray-500 hover:text-cyan-400 transition-all mb-2"
                >
                    <Terminal className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                    {showTerminal && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 120, opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="w-64 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden"
                        >
                            <div className="p-2 border-b border-white/5 flex items-center gap-2">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                </div>
                                <span className="text-[9px] text-gray-500 font-mono">SYSTEM_LOG</span>
                            </div>
                            <div className="p-2 h-20 overflow-y-auto font-mono text-[10px] text-cyan-500/70 space-y-0.5">
                                {logs.length === 0 ? (
                                    <span className="text-gray-600 italic">{t('waiting')}</span>
                                ) : (
                                    logs.map((log, i) => <div key={i}>{log}</div>)
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                EMPTY STATE OVERLAY (Center)
            ═══════════════════════════════════════════════════════════════ */}
            {!modelUrl && !isGenerating && (
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full border border-white/10 flex items-center justify-center">
                            <Layers className="w-8 h-8 text-white/20" />
                        </div>
                        <p className="text-gray-600 text-sm font-mono tracking-wider">
                            {t('awaitingInput')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
