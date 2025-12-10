'use client';

import { Canvas } from '@react-three/fiber';
import { Viewer3D } from './canvas/Viewer3D';
import { Suspense, useState } from 'react';
import { Loader2, Download, RotateCw, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Loader } from '@react-three/drei';

interface ModelViewerProps {
    url: string;
    className?: string;
}

export function ModelViewer({ url, className }: ModelViewerProps) {
    const [autoRotate, setAutoRotate] = useState(true);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = url;
        link.download = 'model.glb';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={cn("relative w-full h-full bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden border border-white/10", className)}>
            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 50 }}>
                <Suspense fallback={null}>
                    <Viewer3D modelUrl={url} autoRotate={autoRotate} />
                </Suspense>
            </Canvas>

            <Loader
                containerStyles={{ background: 'transparent' }}
                innerStyles={{ background: 'rgba(255, 255, 255, 0.1)', width: '200px', height: '4px' }}
                barStyles={{ background: '#22d3ee', height: '4px' }}
                dataInterpolation={(p) => `Loading ${p.toFixed(0)}%`}
                dataStyles={{ color: '#fff', fontSize: '12px', fontFamily: 'monospace', marginTop: '20px' }}
            />

            {/* Controls Overlay */}
            <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={cn("bg-black/50 hover:bg-black/70 text-white border border-white/10 backdrop-blur-md transition-all", autoRotate && "text-cyan-400 border-cyan-400/50")}
                >
                    <RotateCw className="w-4 h-4" />
                </Button>
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleDownload}
                    className="bg-black/50 hover:bg-black/70 text-white border border-white/10 backdrop-blur-md transition-all hover:text-cyan-400"
                >
                    <Download className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
