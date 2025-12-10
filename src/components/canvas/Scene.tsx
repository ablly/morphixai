'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Hero3DGLB } from './Hero3DGLB';
import { Stars, Sparkles } from '@react-three/drei';

export function Scene() {
    return (
        <div className="w-full h-screen bg-black fixed inset-0 -z-10">
            <Canvas
                camera={{ position: [0, 0, 4], fov: 45 }}
                dpr={[1, 2]}
                gl={{ 
                    antialias: true, 
                    alpha: true,
                    toneMapping: 1, // ACESFilmicToneMapping
                    toneMappingExposure: 1.2
                }}
            >
                <Suspense fallback={null}>
                    <color attach="background" args={['#050510']} />

                    {/* Background Enhancement */}
                    <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
                    <Sparkles count={100} scale={15} size={1.5} speed={0.3} opacity={0.4} color="#8888ff" />

                    {/* 环境光 - 强照明保持颜色鲜艳 */}
                    <ambientLight intensity={1.5} color="#ffffff" />
                    
                    {/* 主光源 - 纯白光，不偏色 */}
                    <directionalLight 
                        position={[5, 8, 5]} 
                        intensity={2.5} 
                        color="#ffffff"
                    />
                    
                    {/* 补光 - 从左侧填充 */}
                    <directionalLight 
                        position={[-5, 5, 3]} 
                        intensity={2.0} 
                        color="#ffffff" 
                    />
                    
                    {/* 前光 - 正面照亮 */}
                    <directionalLight 
                        position={[0, 3, 10]} 
                        intensity={1.5} 
                        color="#ffffff" 
                    />
                    
                    {/* 顶光 */}
                    <directionalLight 
                        position={[0, 10, 0]} 
                        intensity={1.0} 
                        color="#ffffff" 
                    />



                    {/* Main Model */}
                    <Hero3DGLB
                        modelPath="https://models.morphix-ai.com/hitem3d.glb"
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
