'use client';

import { useGLTF, OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { useFrame, useLoader } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { createColoredShaders } from './shaders';

interface Viewer3DProps {
    modelUrl: string;
    mode?: 'solid' | 'wireframe' | 'points' | 'liquid';
    intensity?: number;
    autoRotate?: boolean;
    scale?: number;
    showGrid?: boolean;
    position?: [number, number, number];
}

// 智能模型组件：处理所有渲染模式
function SmartModel({ scene, mode }: { scene: THREE.Group, mode: string, intensity: number }) {
    const meshRef = useRef<THREE.Group>(null);
    const pointsRef = useRef<THREE.Points>(null);
    const shaderRef = useRef<THREE.ShaderMaterial>(null);

    // 1. 提取几何数据用于点云/流体模式
    const { positions, uvs, colors, texture } = useMemo(() => {
        const pos: number[] = [];
        const uv: number[] = [];
        const col: number[] = [];
        let tex: THREE.Texture | null = null;

        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                const geometry = mesh.geometry;
                const material = mesh.material as THREE.MeshStandardMaterial;

                // 尝试获取纹理
                if (material && material.map && !tex) {
                    tex = material.map;
                }

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

                        col.push(0.2, 0.8, 1.0); // Default cyan color
                    }
                }
            }
        });

        return {
            positions: new Float32Array(pos),
            uvs: new Float32Array(uv),
            colors: new Float32Array(col),
            texture: tex
        };
    }, [scene]);

    // 2. 创建 Shaders
    const { vertexShader, fragmentShader, uniforms } = useMemo(() => {
        return createColoredShaders(texture, true); // Enable color shift for Viewer3D
    }, [texture]);

    // 3. 动画循环
    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // 更新 Shader Uniforms
        if (shaderRef.current) {
            shaderRef.current.uniforms.uTime.value = time;

            // 根据模式设置 Phase
            // Points: Phase 1.5 (Cloud/Points)
            // Liquid: Phase 2.5 (Wave/Liquid)
            let targetPhase = 0;
            if (mode === 'points') targetPhase = 1.2;
            if (mode === 'liquid') targetPhase = 3.0;

            // 简单的 lerp 过渡
            shaderRef.current.uniforms.uPhase.value = THREE.MathUtils.lerp(
                shaderRef.current.uniforms.uPhase.value,
                targetPhase,
                0.05
            );
        }

        // 更新实体模型材质
        if (meshRef.current) {
            meshRef.current.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    const mat = mesh.material as THREE.MeshStandardMaterial;

                    // Wireframe 模式
                    mat.wireframe = mode === 'wireframe';

                    // 实体模式可见性
                    // 如果是 points 或 liquid，实体模型应该隐藏 (或者透明)
                    // 这里我们简单地切换可见性
                    const isSolidOrWire = mode === 'solid' || mode === 'wireframe';
                    mesh.visible = isSolidOrWire;
                }
            });
        }

        // 点云可见性
        if (pointsRef.current) {
            const isPointsOrLiquid = mode === 'points' || mode === 'liquid';
            pointsRef.current.visible = isPointsOrLiquid;
        }
    });

    return (
        <group>
            {/* 实体/线框模型 */}
            <primitive object={scene} ref={meshRef} />

            {/* 点云/流体模型 */}
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[positions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-aOriginalPosition"
                        args={[positions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-aUv"
                        args={[uvs, 2]}
                    />
                    <bufferAttribute
                        attach="attributes-aColor"
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

function ObjModel({ url, mode }: { url: string, mode: string }) {
    const obj = useLoader(OBJLoader, url);
    // Clone scene to avoid mutating cached object if used elsewhere
    const scene = useMemo(() => {
        const cloned = obj.clone();
        // 为没有材质的网格添加默认材质
        cloned.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (!mesh.material || (Array.isArray(mesh.material) && mesh.material.length === 0)) {
                    mesh.material = new THREE.MeshStandardMaterial({
                        color: 0x888888,
                        roughness: 0.5,
                        metalness: 0.5,
                    });
                }
            }
        });
        return cloned;
    }, [obj]);
    return <SmartModel scene={scene} mode={mode} intensity={0} />;
}

function GltfModel({ url, mode }: { url: string, mode: string }) {
    const { scene } = useGLTF(url);
    const clonedScene = useMemo(() => scene.clone(), [scene]);
    return <SmartModel scene={clonedScene} mode={mode} intensity={0} />;
}

export function Viewer3D({
    modelUrl,
    mode = 'solid',
    intensity = 1.0,
    autoRotate = false,
    scale = 1,
    showGrid = false,
    position = [0, 0, 0]
}: Viewer3DProps) {
    const ref = useRef<THREE.Group>(null);
    const isObj = modelUrl.toLowerCase().endsWith('.obj');

    useFrame((_, delta) => {
        if (autoRotate && ref.current) {
            ref.current.rotation.y += delta * 0.5;
        }
    });

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 1.2, 4]} fov={50} />
            
            {/* 本地灯光设置，不依赖外部 CDN */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={intensity * 0.8} castShadow />
            <directionalLight position={[-5, 3, -5]} intensity={intensity * 0.4} />
            <pointLight position={[0, 3, 0]} intensity={intensity * 0.3} color="#ffffff" />
            
            <group ref={ref} scale={scale} position={position}>
                {isObj ? (
                    <ObjModel url={modelUrl} mode={mode} />
                ) : (
                    <GltfModel url={modelUrl} mode={mode} />
                )}
            </group>
            {showGrid && (
                <Grid
                    position={[0, -0.01, 0]}
                    args={[10.5, 10.5]}
                    cellSize={0.6}
                    cellThickness={1}
                    cellColor="#6f6f6f"
                    sectionSize={3.3}
                    sectionThickness={1.5}
                    sectionColor="#9d4b4b"
                    fadeDistance={30}
                    fadeStrength={1}
                    followCamera={false}
                    infiniteGrid={true}
                />
            )}
            <OrbitControls
                makeDefault
                target={[0, 0.5, 0]}
                autoRotate={autoRotate}
                autoRotateSpeed={2}
                minPolarAngle={0}
                maxPolarAngle={Math.PI / 1.5}
            />
        </>
    );
}
