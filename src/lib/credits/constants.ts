export const GENERATION_COSTS = {
  OBJECT: 9,
  BODY: 9,
  DOWNLOAD: 5, // For Starter users
};

export const ADVANCED_OPTIONS_COSTS = {
  PRIVATE_MODE: 5,
  PRIORITY_QUEUE: 2,
  COMMERCIAL_LICENSE: 100,
  // Keep legacy for compatibility if needed, or remove if fully refactoring
  HD_TEXTURE: 5,
  PBR_MATERIAL: 3,
  RIGGING: 10,
  LOW_POLY: 3,
  PART_SEGMENT: 5,
};

export const SOCIAL_REWARDS = {
  SHARE: 10,
  INVITE: 50,
};

export const DAILY_SOCIAL_LIMIT = 50;
export const REFERRAL_REWARD = 100;

export type GenerationMode = 'OBJECT' | 'BODY' | 'IMAGE_TO_3D' | 'TEXT_TO_3D' | 'MULTI_VIEW' | 'DOODLE'; // Added legacy modes to prevent immediate break
export type QualityLevel = 'STANDARD' | 'HIGH' | 'ULTRA';
export type AdvancedOption = 'PRIVATE_MODE' | 'PRIORITY_QUEUE' | 'COMMERCIAL_LICENSE' | 'HD_TEXTURE' | 'PBR_MATERIAL' | 'RIGGING' | 'LOW_POLY' | 'PART_SEGMENT';

export function calculateTotalCost(
  mode: GenerationMode,
  quality: QualityLevel = 'STANDARD',
  options: AdvancedOption[] = []
): number {
  let baseCost = 9; // Default for OBJECT/BODY

  // Legacy support or specific overrides
  if (mode === 'IMAGE_TO_3D') baseCost = 9;
  if (mode === 'TEXT_TO_3D') baseCost = 9;
  if (mode === 'MULTI_VIEW') baseCost = 15;
  if (mode === 'DOODLE') baseCost = 9;

  let optionsCost = 0;
  options.forEach(opt => {
    if (opt === 'PRIVATE_MODE') optionsCost += ADVANCED_OPTIONS_COSTS.PRIVATE_MODE;
    if (opt === 'PRIORITY_QUEUE') optionsCost += ADVANCED_OPTIONS_COSTS.PRIORITY_QUEUE;
    if (opt === 'COMMERCIAL_LICENSE') optionsCost += ADVANCED_OPTIONS_COSTS.COMMERCIAL_LICENSE;
    // Legacy
    if (opt === 'HD_TEXTURE') optionsCost += ADVANCED_OPTIONS_COSTS.HD_TEXTURE;
    if (opt === 'PBR_MATERIAL') optionsCost += ADVANCED_OPTIONS_COSTS.PBR_MATERIAL;
    if (opt === 'RIGGING') optionsCost += ADVANCED_OPTIONS_COSTS.RIGGING;
    if (opt === 'LOW_POLY') optionsCost += ADVANCED_OPTIONS_COSTS.LOW_POLY;
    if (opt === 'PART_SEGMENT') optionsCost += ADVANCED_OPTIONS_COSTS.PART_SEGMENT;
  });

  return baseCost + optionsCost;
}
