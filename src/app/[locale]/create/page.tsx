'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FixedUI } from '@/components/FixedUI';
import { ImageUploader } from '@/components/ImageUploader';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, ArrowLeft, Terminal, Download, AlertCircle,
    Box, User, Lock, FastForward, Check, ChevronLeft, ChevronRight,
    RotateCcw, Grid3X3, Sun, Wand2, Layers
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { createClient } from '@/lib/supabase/client';
import { GENERATION_COSTS, ADVANCED_OPTIONS_COSTS } from '@/lib/credits/constants';

const Viewer3D = dynamic(() => import('@/components/canvas/Viewer3D').then(mod => ({ default: mod.Viewer3D })), {
    ssr: false,
});

type GenerationMode = 'OBJECT' | 'BODY';

// 工作站状态持久化 key - 需要与用户 ID 关联
const getWorkstationStateKey = (userId: string) => `morphix_workstation_state_${userId}`;

interface WorkstationState {
    mode: GenerationMode;
    isPrivate: boolean;
    isPriority: boolean;
    generationId: string | null;
    modelUrl: string | null;
    completedGenerationId: string | null;
    filePreviewUrl: string | null;
    userId: string; // 添加用户 ID 验证
}

export default function CreatePage() {
    const t = useTranslations('Create');
    const locale = useLocale();
    const router = useRouter();

    // Panel State
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    // Generation State
    const [mode, setMode] = useState<GenerationMode>('OBJECT');
    const [file, setFile] = useState<File | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [modelUrl, setModelUrl] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [credits, setCredits] = useState<number>(0);
    const [generationId, setGenerationId] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [progressStage, setProgressStage] = useState('');

    // Options
    const [isPrivate, setIsPrivate] = useState(false);
    const [isPriority, setIsPriority] = useState(false);

    // Viewer State
    const [intensity, setIntensity] = useState(1.5);
    const [autoRotate, setAutoRotate] = useState(true);
    const [showGrid, setShowGrid] = useState(true);
    const [showTerminal, setShowTerminal] = useState(false);
    
    // Store completed generation ID for download
    const [completedGenerationId, setCompletedGenerationId] = useState<string | null>(null);
    
    // 是否已从 localStorage 恢复状态
    const hasRestoredState = useRef(false);
    const currentUserId = useRef<string | null>(null);

    // 从 localStorage 恢复工作站状态 - 需要先获取用户 ID
    useEffect(() => {
        if (hasRestoredState.current) return;
        
        const restoreState = async () => {
            try {
                // 先获取当前用户 ID
                const response = await fetch('/api/user/credits');
                const data = await response.json();
                
                if (response.status === 401 || !data.userId) {
                    // 未登录，清除所有旧状态
                    localStorage.removeItem('morphix_workstation_state'); // 清除旧的全局状态
                    hasRestoredState.current = true;
                    return;
                }
                
                currentUserId.current = data.userId;
                const stateKey = getWorkstationStateKey(data.userId);
                const savedState = localStorage.getItem(stateKey);
                
                // 清除旧的全局状态（如果存在）
                localStorage.removeItem('morphix_workstation_state');
                
                if (savedState) {
                    const state: WorkstationState = JSON.parse(savedState);
                    // 验证状态属于当前用户
                    if (state.userId === data.userId) {
                        setMode(state.mode || 'OBJECT');
                        setIsPrivate(state.isPrivate || false);
                        setIsPriority(state.isPriority || false);
                        setGenerationId(state.generationId);
                        setModelUrl(state.modelUrl);
                        setCompletedGenerationId(state.completedGenerationId);
                        setFilePreviewUrl(state.filePreviewUrl);
                        
                        if (state.generationId && !state.modelUrl) {
                            setIsGenerating(true);
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to restore workstation state:', e);
            }
            hasRestoredState.current = true;
        };
        
        restoreState();
    }, []);

    // 保存工作站状态到 localStorage - 与用户 ID 关联
    useEffect(() => {
        if (!hasRestoredState.current || !currentUserId.current) return;
        
        const state: WorkstationState = {
            mode,
            isPrivate,
            isPriority,
            generationId,
            modelUrl,
            completedGenerationId,
            filePreviewUrl,
            userId: currentUserId.current,
        };
        const stateKey = getWorkstationStateKey(currentUserId.current);
        localStorage.setItem(stateKey, JSON.stringify(state));
    }, [mode, isPrivate, isPriority, generationId, modelUrl, completedGenerationId, filePreviewUrl]);

    // Calculate cost
    const calculateCost = useCallback(() => {
        let cost = mode === 'OBJECT' ? GENERATION_COSTS.OBJECT : GENERATION_COSTS.BODY;
        if (isPrivate) cost += ADVANCED_OPTIONS_COSTS.PRIVATE_MODE;
        if (isPriority) cost += ADVANCED_OPTIONS_COSTS.PRIORITY_QUEUE;
        return cost;
    }, [mode, isPrivate, isPriority]);

    const creditsRequired = calculateCost();

    // Fetch credits and check auth - 使用 API 路由确保服务端认证
    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const response = await fetch('/api/user/credits');
                const data = await response.json();
                
                if (response.status === 401) {
                    console.log('[Create] No authenticated user, redirecting to login');
                    router.push(`/${locale}/login?redirect=/${locale}/create`);
                    return;
                }
                
                console.log('[Create] Credits loaded:', data.balance);
                setCredits(data.balance || 0);
            } catch (error) {
                console.error('[Create] Error fetching credits:', error);
                setCredits(0);
            }
        };
        fetchCredits();

        // 订阅积分变化 - 只监听当前用户
        const supabase = createClient();
        let creditsChannel: ReturnType<typeof supabase.channel> | null = null;
        
        const setupCreditsSubscription = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) return;
            
            creditsChannel = supabase
                .channel(`create-credits-${currentUser.id}`)
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'user_credits',
                    filter: `user_id=eq.${currentUser.id}`
                }, (payload) => {
                    console.log('[Create] Credits update:', payload.new);
                    if (payload.new && 'balance' in payload.new) {
                        setCredits((payload.new as { balance: number }).balance);
                    }
                })
                .subscribe((status) => {
                    console.log('[Create] Credits subscription status:', status);
                });
        };
        
        setupCreditsSubscription();

        return () => {
            if (creditsChannel) supabase.removeChannel(creditsChannel);
        };
    }, [router, locale]);

    // Poll generation status
    useEffect(() => {
        if (!generationId || !isGenerating) return;

        // Simulated progress for UX
        const stages = [
            { progress: 10, stage: locale === 'zh' ? '上传图片...' : 'Uploading image...' },
            { progress: 30, stage: locale === 'zh' ? '分析结构...' : 'Analyzing structure...' },
            { progress: 50, stage: locale === 'zh' ? '生成几何体...' : 'Generating geometry...' },
            { progress: 70, stage: locale === 'zh' ? '优化模型...' : 'Optimizing model...' },
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
        }, 3000);

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
                    // Store the generation ID for download before clearing
                    setCompletedGenerationId(generationId);
                    setGenerationId(null);
                    // Refresh credits
                    const supabase = createClient();
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        const { data } = await supabase.from('user_credits').select('balance').eq('user_id', user.id).single();
                        if (data) setCredits(data.balance);
                    }
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

    const handleGenerate = async () => {
        if (!file) return;
        setIsGenerating(true); setLogs([]); setModelUrl(null); setError(null);
        if (credits < creditsRequired) { setError(t('insufficientCredits')); setIsGenerating(false); return; }
        setLogs(['> Initializing...']);

        try {
            const formData = new FormData();
            formData.append('mode', mode);
            formData.append('file', file);
            formData.append('isPrivate', isPrivate.toString());
            formData.append('isPriority', isPriority.toString());

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

    const handleDownload = async () => {
        const downloadId = completedGenerationId || generationId;
        if (!modelUrl || !downloadId) return;

        try {
            // Call download API to handle credits and verification
            const res = await fetch('/api/generate/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ generationId: downloadId })
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 402) {
                    // Insufficient credits
                    setError(data.error || 'Not enough credits to download');
                    return;
                }
                throw new Error(data.error || 'Download failed');
            }

            // Download the file
            const link = document.createElement('a');
            link.href = data.modelUrl;
            link.download = `morphix-${mode.toLowerCase()}-${Date.now()}.glb`;
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
            }
        } catch (err: any) {
            console.error('Download error:', err);
            setError(err.message || 'Failed to download model');
        }
    };

    const modeConfig = [
        { id: 'OBJECT', icon: Box, label: locale === 'zh' ? '通用物体' : 'General Object', desc: locale === 'zh' ? '适合各种物品、家具、道具' : 'Items, furniture, props' },
        { id: 'BODY', icon: User, label: locale === 'zh' ? '人物角色' : 'Human Body', desc: locale === 'zh' ? '适合全身人物、角色模型' : 'Full body characters' },
    ];

    return (
        <div className="fixed inset-0 bg-black overflow-hidden">
            {/* SEO: Hidden h1 for search engines */}
            <h1 className="sr-only">
                {locale === 'zh' ? 'Morphix AI 3D模型生成器 - 图片转3D' : 'Morphix AI 3D Model Generator - Image to 3D'}
            </h1>
            <FixedUI />

            {/* 3D Canvas */}
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
                            {showGrid && <gridHelper args={[20, 20, '#1a1a2e', '#0a0a15']} position={[0, -1, 0]} />}
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

            {/* Loading Overlay */}
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
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Back Button */}
            <Link href={`/${locale}`} className="absolute top-6 left-6 z-30">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-white/70 hover:text-white hover:border-cyan-500/50 transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </motion.button>
            </Link>

            {/* Credits Display */}
            <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
                <div className="px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className={`font-mono text-sm ${credits < 10 ? 'text-red-400' : 'text-white'}`}>
                        {credits}
                    </span>
                </div>
            </div>

            {/* Control Panel */}
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
                            <div className="p-5 border-b border-white/5">
                                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                                    {t('station')}
                                </h2>
                                <p className="text-xs text-gray-500 font-mono mt-1">FAL.AI SAM-3D ENGINE</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                                {/* Mode Selection */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        {t('modes.title')}
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {modeConfig.map(({ id, icon: Icon, label, desc }) => (
                                            <button
                                                key={id}
                                                onClick={() => setMode(id as GenerationMode)}
                                                className={`p-4 rounded-xl border transition-all flex flex-col items-start gap-2 text-left ${mode === id
                                                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                                                    : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'
                                                    }`}
                                            >
                                                <Icon className="w-6 h-6" />
                                                <div>
                                                    <span className="text-sm font-bold block">{label}</span>
                                                    <span className="text-[10px] opacity-70">{desc}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-purple-400" />
                                        {t('referenceImage')}
                                    </label>
                                    <ImageUploader 
                                        onFileSelect={setFile} 
                                        onPreviewChange={setFilePreviewUrl}
                                        initialPreview={filePreviewUrl}
                                    />
                                </div>

                                {/* Options */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        {t('advancedOptions.title')}
                                    </label>

                                    <button onClick={() => setIsPrivate(!isPrivate)}
                                        className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${isPrivate ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-white/5 border-white/5 text-gray-500'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Lock className="w-4 h-4" />
                                            <span className="text-sm">{locale === 'zh' ? '隐私模式' : 'Private Mode'}</span>
                                        </div>
                                        <span className="text-xs opacity-60">+{ADVANCED_OPTIONS_COSTS.PRIVATE_MODE}</span>
                                    </button>

                                    <button onClick={() => setIsPriority(!isPriority)}
                                        className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${isPriority ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/5 text-gray-500'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FastForward className="w-4 h-4" />
                                            <span className="text-sm">{locale === 'zh' ? '优先队列' : 'Priority Queue'}</span>
                                        </div>
                                        <span className="text-xs opacity-60">+{ADVANCED_OPTIONS_COSTS.PRIORITY_QUEUE}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Footer */}
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

                                <Button
                                    onClick={handleGenerate}
                                    disabled={!file || isGenerating || credits < creditsRequired}
                                    className={`w-full py-6 text-base font-bold rounded-xl transition-all ${!file || isGenerating || credits < creditsRequired
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

            {/* Panel Toggle */}
            <motion.button
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className="absolute top-1/2 -translate-y-1/2 z-30 p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-white/50 hover:text-white transition-all"
                animate={{ left: isPanelOpen ? 408 : 24 }}
            >
                {isPanelOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </motion.button>

            {/* Viewport Controls */}
            <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full">
                    <button onClick={() => setAutoRotate(!autoRotate)} className={`p-2 rounded-full transition-all ${autoRotate ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-white'}`}>
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowGrid(!showGrid)} className={`p-2 rounded-full transition-all ${showGrid ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-white'}`}>
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-1 px-2">
                        <Sun className="w-3 h-3 text-gray-500" />
                        <input type="range" min="0.5" max="3" step="0.1" value={intensity} onChange={(e) => setIntensity(parseFloat(e.target.value))} className="w-16 h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                    </div>
                </div>
            </div>

            {/* Download Button */}
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
                            {t('downloadBtn')} .GLB
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
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
