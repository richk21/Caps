export type AnimationSpeed = "slow" | "normal" | "fast";

const animationDurations: Record<AnimationSpeed, number> = {
  slow: 0.45,
  normal: 0.26,
  fast: 0.14,
};

export function getAnimationProgress(
  currentTime: number,
  startTime: number,
  speed: AnimationSpeed,
): number {
  const duration = animationDurations[speed];

  const elapsed = currentTime - startTime;

  if (elapsed <= 0) {
    return 0;
  }

  return Math.min(elapsed / duration, 1);
}

/**
 * Smooth ease-out curve.
 *
 * Starts quickly and settles smoothly.
 */
export function easeOutCubic(value: number): number {
  const t = Math.max(0, Math.min(1, value));

  return 1 - Math.pow(1 - t, 3);
}

/**
 * Slight overshoot used for pop animations.
 */
export function easeOutBack(value: number): number {
  const t = Math.max(0, Math.min(1, value));

  const c1 = 1.70158;
  const c3 = c1 + 1;

  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * Returns the words that should currently
 * be visible for a typewriter animation.
 */
export function getVisibleWordCount(
  wordsLength: number,
  progress: number,
): number {
  if (wordsLength <= 0) {
    return 0;
  }

  const safeProgress = Math.max(0, Math.min(1, progress));

  return Math.ceil(wordsLength * safeProgress);
}

/**
 * Returns progress for an individual word.
 */
export function getWordProgress(
  currentTime: number,
  wordStart: number,
  wordEnd: number,
): number {
  const duration = Math.max(0.001, wordEnd - wordStart);

  const progress = (currentTime - wordStart) / duration;

  return Math.max(0, Math.min(1, progress));
}
