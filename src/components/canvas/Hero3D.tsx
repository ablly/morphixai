'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import * as THREE from 'three';
import { createColoredShaders } from './shaders';

interface Hero3DProps {
    modelPath: string;
    materialPath: string;
}

export function Hero3D({ modelPath, materialPath }: Hero3DProps) {
    const materials = useLoader(MTLLoader, materialPath);
    const obj = useLoader(OBJLoader, modelPath, (loader) => {
        materials.preload();
        (loader as OBJLoader).setMaterials(materials);
    });

    // 提取纹理用于点云着色
    const texture = useMemo(() => {
        let tex: THREE.Texture | null = null;
        obj.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                const mat = mesh.material as THREE.MeshStandardMaterial;
                if (mat && mat.map) {
                    tex = mat.map;
                }
            }
        });
        return tex;
    }, [obj]);

    // 保持原始鲜艳颜色 - 增强材质，并启用透明度
    useMemo(() => {
        obj.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                const mat = mesh.material as THREE.MeshStandardMaterial;
                if (mat) {
                    mat.roughness = 0.4;
                    mat.metalness = 0.1;
                    mat.emissive = new THREE.Color(0x111111);
                    mat.emissiveIntensity = 0.3;
                    mat.transparent = true;
                    mat.opacity = 1;
                    mat.needsUpdate = true;
                }
            }
        });
    }, [obj]);

    // 用于平滑过渡的透明度
    const smoothedOpacity = useRef(1);


    const meshRef = useRef<THREE.Group>(null);
    const pointsRef = useRef<THREE.Points>(null);
    const shaderRef = useRef<THREE.ShaderMaterial>(null);
    const groupRef = useRef<THREE.Group>(null);

    const [time, setTime] = useState(0);
    const [scrollOffset, setScrollOffset] = useState(0);
    const [entranceTime, setEntranceTime] = useState(0);

    // 监听原生滚动
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const offset = maxScroll > 0 ? scrollY / maxScroll : 0;
            setScrollOffset(Math.min(Math.max(offset, 0), 1));
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const smoothedPhase = useRef(0);

    // Extract vertices and UV coordinates for colored point cloud
    const { positions, originalPositions, uvs, colors } = useMemo(() => {
        const pos: number[] = [];
        const uv: number[] = [];
        const col: number[] = [];

        obj.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                const geometry = mesh.geometry;

                if (geometry.attributes.position) {
                    const p = geometry.attributes.position.array;
                    const uvAttr = geometry.attributes.uv;

                    for (let i = 0; i < p.length; i += 3) {
                        pos.push(p[i], p[i + 1], p[i + 2]);

                        if (uvAttr) {
                            const uvIndex = (i / 3) * 2;
                            uv.push(uvAttr.array[uvIndex] || 0, uvAttr.array[uvIndex + 1] || 0);
                        } else {
                            uv.push(0, 0);
                        }

                        col.push(0.2, 0.8, 1.0);
                    }
                }
            }
        });
        return {
            positions: new Float32Array(pos),
            originalPositions: new Float32Array(pos),
            uvs: new Float32Array(uv),
            colors: new Float32Array(col),
        };
    }, [obj]);

    const { vertexShader, fragmentShader, uniforms } = useMemo(() => {
        return createColoredShaders(texture);
    }, [texture]);


    useFrame((state, delta) => {
        const newTime = time + delta;
        setTime(newTime);

        if (entranceTime < 1) {
            setEntranceTime(prev => Math.min(prev + delta * 0.5, 1));
        }

        const easeOutElastic = (x: number): number => {
            const c4 = (2 * Math.PI) / 3;
            return x === 0
                ? 0
                : x === 1
                    ? 1
                    : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
        };

        const entranceScale = easeOutElastic(entranceTime);
        const offset = scrollOffset;

        let targetPhase = 0;
        if (offset < 0.15) {
            targetPhase = (offset / 0.15);
        } else if (offset < 0.55) {
            targetPhase = 1.0 + ((offset - 0.15) / 0.40);
        } else if (offset < 0.75) {
            targetPhase = 2.0 + ((offset - 0.55) / 0.20);
        } else if (offset < 0.95) {
            targetPhase = 3.0 + ((offset - 0.75) / 0.20);
        } else {
            targetPhase = 4.0 + ((offset - 0.95) / 0.05);
        }

        smoothedPhase.current = THREE.MathUtils.lerp(smoothedPhase.current, targetPhase, 0.01);

        if (shaderRef.current) {
            shaderRef.current.uniforms.uTime.value = newTime;
            shaderRef.current.uniforms.uPhase.value = smoothedPhase.current;
        }

        const targetZ = 4.0 - (offset * 2.0);
        state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.02);

        if (groupRef.current) {
            groupRef.current.rotation.y = newTime * 0.1 + offset * Math.PI;
            groupRef.current.scale.setScalar(entranceScale);
        }

        // 平滑过渡材质透明度
        if (meshRef.current) {
            // 计算目标透明度：
            // 向下滚动：phase 0-0.3 完全显示，0.3-0.8 快速渐隐
            // 向上滚动：phase 4.5-5.0 缓慢渐显（粒子聚合完成后）
            let targetOpacity = 1;
            if (smoothedPhase.current >= 0.3 && smoothedPhase.current < 0.8) {
                targetOpacity = 1 - (smoothedPhase.current - 0.3) / 0.5;
            } else if (smoothedPhase.current >= 0.8 && smoothedPhase.current < 4.5) {
                targetOpacity = 0;
            } else if (smoothedPhase.current >= 4) {
                targetOpacity = Math.min((smoothedPhase.current - 4) / 0.5, 1);
            }
            
            // 渐隐快速，渐显缓慢
            const lerpSpeed = targetOpacity > smoothedOpacity.current ? 0.03 : 0.08;
            smoothedOpacity.current = THREE.MathUtils.lerp(smoothedOpacity.current, targetOpacity, lerpSpeed);
            
            // 应用透明度到所有材质
            meshRef.current.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    const mat = mesh.material as THREE.MeshStandardMaterial;
                    if (mat) {
                        mat.opacity = smoothedOpacity.current;
                        // 当透明度很低时隐藏以提高性能
                        mesh.visible = smoothedOpacity.current > 0.01;
                    }
                }
            });
        }
    });

    return (
        <group ref={groupRef} scale={[0, 0, 0]}>
            <primitive object={obj} ref={meshRef} />

            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={positions.length / 3}
                        array={positions}
                        itemSize={3}
                        args={[positions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-aOriginalPosition"
                        count={originalPositions.length / 3}
                        array={originalPositions}
                        itemSize={3}
                        args={[originalPositions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-aUv"
                        count={uvs.length / 2}
                        array={uvs}
                        itemSize={2}
                        args={[uvs, 2]}
                    />
                    <bufferAttribute
                        attach="attributes-aColor"
                        count={colors.length / 3}
                        array={colors}
                        itemSize={3}
                        args={[colors, 3]}
                    />
                </bufferGeometry>
                <shaderMaterial
                    ref={shaderRef}
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    transparent
                    depthWrite={false}
                    uniforms={uniforms}
                />
            </points>
        </group>
    );
}
