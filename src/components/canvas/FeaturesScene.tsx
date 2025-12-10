'use client';

import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, TorusKnot, Float } from '@react-three/drei';
import * as THREE from 'three';

function NeuralShape() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <TorusKnot ref={meshRef} args={[1, 0.3, 128, 32]} scale={1.5}>
                <meshStandardMaterial
                    color="#4488ff"
                    roughness={0.1}
                    metalness={0.8}
                    wireframe={true}
                    emissive="#0044aa"
                    emissiveIntensity={0.5}
                />
            </TorusKnot>
        </Float>
    );
}

export function FeaturesScene() {
    return (
        <div className="w-full h-screen fixed inset-0 -z-10 pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 6], fov: 45 }}
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: true,
                    toneMapping: 1,
                    toneMappingExposure: 1.0
                }}
            >
                <Suspense fallback={null}>
                    <color attach="background" args={['#020205']} />

                    {/* Background Elements */}
                    <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
                    <Sparkles count={80} scale={12} size={2} speed={0.4} opacity={0.3} color="#00ffff" />

                    {/* Lighting */}
                    <ambientLight intensity={0.2} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffff" />
                    <pointLight position={[-10, -10, -10]} intensity={1.5} color="#ff00ff" />

                    {/* Procedural Neural Geometry */}
                    <NeuralShape />
                </Suspense>
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 pointer-events-none" />
        </div>
    );
}
