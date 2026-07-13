export const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200] as const;

export const getLevelFromXp = (xp: number) => {
  const safeXp = Math.max(0, Math.floor(xp || 0));
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i -= 1) {
    if (safeXp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
};

export const getXpForCurrentLevel = (level: number) => {
  const safeLevel = Math.max(1, Math.floor(level || 1));
  if (safeLevel <= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[safeLevel - 1];
  return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (safeLevel - LEVEL_THRESHOLDS.length) * 800;
};

export const getXpForNextLevel = (level: number) => {
  const safeLevel = Math.max(1, Math.floor(level || 1));
  if (safeLevel < LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[safeLevel];
  return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (safeLevel - LEVEL_THRESHOLDS.length + 1) * 800;
};

export const getLevelProgressPercentage = (xp: number) => {
  const level = getLevelFromXp(xp);
  const current = getXpForCurrentLevel(level);
  const next = getXpForNextLevel(level);
  if (next <= current) return 100;
  return Math.max(0, Math.min(100, Math.round(((Math.max(0, xp) - current) / (next - current)) * 100)));
};

export const getXpNeededForNextLevel = (xp: number) => {
  const level = getLevelFromXp(xp);
  return Math.max(0, getXpForNextLevel(level) - Math.max(0, Math.floor(xp || 0)));
};
