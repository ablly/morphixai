import * as THREE from 'three';

// 创建带颜色的 shaders
export function createColoredShaders(texture: THREE.Texture | null, enableColorShift: boolean = false) {
  const uniforms = {
    uTime: { value: 0 },
    uPhase: { value: 0 },
    uTexture: { value: texture },
    uHasTexture: { value: texture ? 1.0 : 0.0 },
    uEnableColorShift: { value: enableColorShift ? 1.0 : 0.0 },
  };

  return { vertexShader, fragmentShader, uniforms };
}

export const vertexShader = `
  uniform float uTime;
  uniform float uPhase; // 0-5 Range
  
  attribute vec3 aOriginalPosition;
  attribute vec2 aUv;
  attribute vec3 aColor;
  
  varying vec3 vNormal;
  varying float vPhase;
  varying vec2 vUv;
  varying vec3 vColor;
  
  // Simplex 3D Noise 
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i); 
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
             
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  // 更平滑的缓动函数 - easeInOutCubic
  float easeInOutCubic(float t) {
      return t < 0.5 
          ? 4.0 * t * t * t 
          : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    vNormal = normal;
    vPhase = uPhase;
    vUv = aUv;
    vColor = aColor;
    
    vec3 pos = position;
    vec3 targetPos = pos;
    
    // Phase Logic (0-5)
    
    float cloudFactor = 0.0;
    float waveFactor = 0.0;
    
    if (uPhase < 1.0) {
        // 0->1: 保持原位
        cloudFactor = 0.0;
    } else if (uPhase < 2.0) {
        // 1->2: 缓慢扩散
        float t = uPhase - 1.0;
        cloudFactor = easeInOutCubic(t);
    } else if (uPhase < 3.0) {
        // 2->3: 保持扩散 + 波浪
        float t = uPhase - 2.0;
        cloudFactor = mix(1.0, 0.5, easeInOutCubic(t));
        waveFactor = easeInOutCubic(t);
    } else if (uPhase < 4.0) {
        // 3->4: 缓慢聚合
        float t = uPhase - 3.0;
        cloudFactor = mix(0.5, 0.0, easeInOutCubic(t));
        waveFactor = 1.0 - easeInOutCubic(t);
    } else {
        // 4->5: 恢复原位
        cloudFactor = 0.0;
    }

    // CLOUD SCATTER - 原始扩散距离 (70.0)
    if (cloudFactor > 0.001) {
        float noiseSpeed = 0.05;
        float noiseX = snoise(pos * 0.8 + vec3(uTime * noiseSpeed, 0.0, 0.0));
        float noiseY = snoise(pos * 0.8 + vec3(0.0, uTime * noiseSpeed, 0.0));
        float noiseZ = snoise(pos * 0.8 + vec3(0.0, 0.0, uTime * noiseSpeed));
        
        vec3 randomDir = normalize(vec3(noiseX, noiseY, noiseZ));
        targetPos += randomDir * cloudFactor * 70.0; 
    }

    // WAVE MOTION - 增强的波浪效果
    if (waveFactor > 0.001) {
         float waveTime = uTime * 1.5; // 加快波浪速度
         // 增加振幅
         float waveY = sin(pos.x * 0.8 + waveTime) * 15.0; 
         float waveX = cos(pos.y * 0.8 + waveTime) * 15.0;
         float waveZ = sin(pos.z * 0.8 + waveTime) * 15.0;
         
         targetPos.x += waveX * waveFactor;
         targetPos.y += waveY * waveFactor;
         targetPos.z += waveZ * waveFactor;
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(targetPos, 1.0);
    // 扩散时粒子变大，增加蓬松感
    float sizeMultiplier = 1.0 + cloudFactor * 2.5;
    gl_PointSize = 4.0 * sizeMultiplier * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const fragmentShader = `
  uniform float uTime;
  uniform float uPhase;
  uniform float uEnableColorShift;
  varying vec3 vNormal;
  
  // easeInOutCubic 缓动函数
  float easeInOutCubic(float t) {
      return t < 0.5 
          ? 4.0 * t * t * t 
          : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }
  
  void main() {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;
    
    // 基础颜色：淡蓝色
    vec3 color = vec3(0.6, 0.85, 1.0); // Pale Tech Blue
    
    // Liquid 模式 (Phase > 2.0) 颜色变换 - 仅当启用时
    if (uEnableColorShift > 0.5 && uPhase > 2.0 && uPhase < 4.0) {
        float t = (uPhase - 2.0) / 2.0; // 0-1 range roughly
        // 混合紫色/粉色
        vec3 liquidColor = vec3(0.8, 0.4, 1.0);
        float wave = sin(uTime * 2.0) * 0.5 + 0.5;
        color = mix(color, liquidColor, wave * 0.8);
    }
    
    // 添加轻微发光效果
    float glow = 1.0 - r;
    color += color * glow * 0.5;
    
    float alpha = 0.8;
    
    // Phase 0-1.5: 点云缓慢淡入 (与实体模型交叉过渡)
    if (uPhase < 1.5) {
        float t = uPhase / 1.5;
        alpha = easeInOutCubic(t) * 0.8;
    }
    // Phase 3.5-5: 点云缓慢淡出 (与实体模型交叉过渡)
    else if (uPhase > 3.5) {
        float t = (uPhase - 3.5) / 1.5;
        alpha = (1.0 - easeInOutCubic(min(t, 1.0))) * 0.8;
    }
    
    gl_FragColor = vec4(color, alpha);
  }
`;
