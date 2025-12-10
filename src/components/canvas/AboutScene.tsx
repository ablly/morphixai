'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float } from '@react-three/drei';

export function AboutScene() {
    const pointsRef = useRef<THREE.Points>(null);

    // Generate DNA-like double helix particles
    const particles = useMemo(() => {
        const count = 2000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const color1 = new THREE.Color('#06b6d4'); // Cyan
        const color2 = new THREE.Color('#8b5cf6'); // Violet

        for (let i = 0; i < count; i++) {
            const t = i / count;
            const angle = t * Math.PI * 20; // Number of turns
            const radius = 2;
            const height = (t - 0.5) * 15;

            // Double helix structure
            const strand = i % 2 === 0 ? 1 : -1;

            // Add some randomness/noise
            const randomOffset = Math.random() * 0.2;

            const x = Math.cos(angle + (strand * Math.PI)) * radius + (Math.random() - 0.5) * 0.5;
            const y = height;
            const z = Math.sin(angle + (strand * Math.PI)) * radius + (Math.random() - 0.5) * 0.5;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Color gradient
            const mixedColor = color1.clone().lerp(color2, t);
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        return { positions, colors };
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.002;
            pointsRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
        }
    });

    return (
        <group>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <points ref={pointsRef}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={particles.positions.length / 3}
                            array={particles.positions}
                            itemSize={3}
                            args={[particles.positions, 3]}
                        />
                        <bufferAttribute
                            attach="attributes-color"
                            count={particles.colors.length / 3}
                            array={particles.colors}
                            itemSize={3}
                            args={[particles.colors, 3]}
                        />
                    </bufferGeometry>
                    <pointsMaterial
                        size={0.05}
                        vertexColors
                        transparent
                        opacity={0.8}
                        sizeAttenuation
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </points>
            </Float>

            {/* Ambient glow */}
            <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#8b5cf6" />
        </group>
    );
}
