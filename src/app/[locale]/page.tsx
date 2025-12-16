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
            
            {/* Badges - Fixed Bottom Right */}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end">
                <a 
                    href="https://www.nxgntools.com/tools/morphix-ai?utm_source=morphix-ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="opacity-60 hover:opacity-100 transition-opacity"
                >
                    <img 
                        src="https://www.nxgntools.com/api/embed/morphix-ai?type=FEATURED_ON" 
                        alt="Featured on NextGen Tools" 
                        className="h-10"
                    />
                </a>
                <a 
                    href="https://frogdr.com/morphix-ai.com?utm_source=morphix-ai.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="opacity-60 hover:opacity-100 transition-opacity"
                >
                    <img 
                        src="https://frogdr.com/morphix-ai.com/badge-white.svg" 
                        alt="Monitor your Domain Rating with FrogDR" 
                        className="h-10"
                    />
                </a>
            </div>
        </main>
    );
}
