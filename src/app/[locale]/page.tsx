'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FixedUI } from '@/components/FixedUI';
import { LandingOverlay } from '@/components/LandingOverlay';
import { Preloader } from '@/components/Preloader';

// Dynamic import of heavy 3D Scene component for faster page load
const Scene = dynamic(() => import('@/components/canvas/Scene').then(mod => ({ default: mod.Scene })), {
    ssr: false,
    loading: () => <div className="w-full h-screen bg-black fixed inset-0 -z-10" />
});

export default function Home() {
    const [loadingComplete, setLoadingComplete] = useState(false);

    return (
        <main className="min-h-screen relative">
            <Preloader onLoadingComplete={() => setLoadingComplete(true)} />
            <FixedUI />
            <Scene />
            <LandingOverlay loadingComplete={loadingComplete} />
        </main>
    );
}
