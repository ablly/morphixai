/**
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    MORPHIX AI 积分消耗表                      │
 * ├─────────────────────────────────────────────────────────────┤
 * │ 【基础生成】                                                  │
 * │   文字转3D .......................... 10 积分                │
 * │   单图转3D (Standard 512px) ......... 10 积分                │
 * │   单图转3D (High 1024px) ............ 15 积分                │
 * │   单图转3D (Ultra 2048px) ........... 25 积分                │
 * │   多视角转3D (2-6张图) .............. 15 积分                │
 * │   涂鸦转3D .......................... 10 积分                │
 * ├─────────────────────────────────────────────────────────────┤
 * │ 【高级选项】(可叠加)                                          │
 * │   高清纹理 (HD Texture) ............. +5 积分                │
 * │   PBR材质 (金属/粗糙/法线) .......... +3 积分                │
 * │   骨骼绑定 (Rigging) ................ +10 积分               │
 * │   智能低多边形 (Low-poly) ........... +3 积分                │
 * │   部件分割 .......................... +5 积分                │
 * ├─────────────────────────────────────────────────────────────┤
 * │ 【输出格式】(免费)                                            │
 * │   GLB / FBX / OBJ / USD / STL                               │
 * └─────────────────────────────────────────────────────────────┘
 */

// 基础生成模式积分消耗
export const GENERATION_COSTS = {
  // 单图转3D
  STANDARD: 10, // 512px - 标准生成
  HIGH: 15, // 1024px - 高清生成
  ULTRA: 25, // 2048px - 超清生成
  // 其他生成模式
  TEXT_TO_3D: 10, // 文字转3D
  MULTI_VIEW: 15, // 多视角转3D (2-6张图)
  DOODLE: 10, // 涂鸦转3D
} as const;

// 高级选项积分消耗 (可叠加)
export const ADVANCED_OPTIONS_COSTS = {
  HD_TEXTURE: 5, // 高清纹理
  PBR_MATERIAL: 3, // PBR材质 (金属度/粗糙度/法线贴图)
  RIGGING: 10, // 骨骼绑定
  LOW_POLY: 3, // 智能低多边形
  PART_SEGMENT: 5, // 部件分割
} as const;

// 社交分享奖励
export const SOCIAL_REWARDS = {
  TWITTER: 5,
  TIKTOK: 5,
  REDDIT: 5,
  LINKEDIN: 5,
  FACEBOOK: 3,
} as const;

export const DAILY_SOCIAL_LIMIT = 20;
export const REFERRAL_REWARD = 5;

// 生成模式类型
export type GenerationMode = 'IMAGE_TO_3D' | 'TEXT_TO_3D' | 'MULTI_VIEW' | 'DOODLE';
export type QualityLevel = 'STANDARD' | 'HIGH' | 'ULTRA';
export type AdvancedOption = keyof typeof ADVANCED_OPTIONS_COSTS;

// 计算总积分消耗
export function calculateTotalCost(
  mode: GenerationMode,
  quality: QualityLevel,
  options: AdvancedOption[] = []
): number {
  let baseCost = 0;

  // 基础成本
  switch (mode) {
    case 'IMAGE_TO_3D':
      baseCost = GENERATION_COSTS[quality];
      break;
    case 'TEXT_TO_3D':
      baseCost = GENERATION_COSTS.TEXT_TO_3D;
      break;
    case 'MULTI_VIEW':
      baseCost = GENERATION_COSTS.MULTI_VIEW;
      break;
    case 'DOODLE':
      baseCost = GENERATION_COSTS.DOODLE;
      break;
  }

  // 高级选项成本
  const optionsCost = options.reduce((sum, opt) => sum + ADVANCED_OPTIONS_COSTS[opt], 0);

  return baseCost + optionsCost;
}
