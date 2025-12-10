'use client';

import { useState, Suspense, Component, ReactNode } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import dynamic from 'next/dynamic';
import { FixedUI } from '@/components/FixedUI';
import { ViewerControls } from '@/components/ViewerControls';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Sparkles, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';

// Dynamic import of heavy 3D Viewer component
const Viewer3D = dynamic(() => import('@/components/canvas/Viewer3D').then(mod => ({ default: mod.Viewer3D })), {
    ssr: false,
    loading: () => null,
});

// 简单的错误边界组件
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, ErrorBoundaryState> {
    constructor(props: { children: ReactNode; fallback: ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

// 错误回退 UI
function ErrorFallbackUI() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <div className="text-center p-8">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">3D 模型加载失败</h3>
                <p className="text-gray-400 mb-4 text-sm max-w-md">请刷新页面重试</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                    刷新页面
                </Button>
            </div>
        </div>
    );
}

export default function DemoPage() {
    const t = useTranslations('Demo');
    const locale = useLocale();
    const [intensity, setIntensity] = useState(1.5);
    const [autoRotate, setAutoRotate] = useState(true);

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative">
            <FixedUI />

            {/* Back Button */}
            <div className="fixed top-20 left-6 z-40">
                <Link href={`/${locale}`}>
                    <button className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all group">
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                </Link>
            </div>

            {/* Full Screen 3D Background */}
            <div className="fixed inset-0 z-0">
                <ErrorBoundary fallback={<ErrorFallbackUI />}>
                    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0.8, 4], fov: 45 }}>
                        <color attach="background" args={['#050505']} />
                        <Suspense fallback={null}>
                            <Viewer3D 
                                modelUrl="/models/42111f4fe09b155e6cc82dd5924bd964.glb"
                                mode="solid"
                                intensity={intensity}
                                autoRotate={autoRotate}
                                scale={1}
                                showGrid={true}
                                position={[0, -1.5, 0]}
                            />
                        </Suspense>
                    </Canvas>
                </ErrorBoundary>
                <Loader
                    containerStyles={{ background: 'transparent' }}
                    innerStyles={{ background: 'rgba(255, 255, 255, 0.1)', width: '200px', height: '4px' }}
                    barStyles={{ background: '#22d3ee', height: '4px' }}
                    dataInterpolation={(p) => `Loading ${p.toFixed(0)}%`}
                    dataStyles={{ color: '#fff', fontSize: '12px', fontFamily: 'monospace', marginTop: '20px' }}
                />
            </div>

            {/* Overlay UI */}
            <div className="relative z-10 pointer-events-none h-screen flex flex-col justify-between pt-24 pb-12 px-6">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center pointer-events-auto"
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-2 tracking-tight drop-shadow-lg">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto drop-shadow-md">
                        {t('subtitle')}
                    </p>
                </motion.div>

                {/* Controls Panel (Top Right) */}
                <div className="absolute top-28 right-6 pointer-events-auto">
                    <ViewerControls
                        intensity={intensity}
                        setIntensity={setIntensity}
                        autoRotate={autoRotate}
                        setAutoRotate={setAutoRotate}
                        className="bg-black/40 backdrop-blur-xl border-white/5"
                    />
                </div>

                {/* Bottom Actions */}
                <div className="flex justify-center items-center pb-16 pointer-events-none">
                    <div className="pointer-events-auto">
                        <Link href={`/${locale}/create`}>
                            <Button
                                size="lg"
                                className="bg-white/90 text-black hover:bg-cyan-400 hover:text-black font-bold text-lg px-8 py-6 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105 backdrop-blur-sm"
                            >
                                <Sparkles className="w-5 h-5 mr-2" />
                                {t('remix')}
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
