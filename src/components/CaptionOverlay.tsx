import type { CSSProperties } from "react";

import { useEditorStore } from "../store";

import {
  getAnimationProgress,
  easeOutCubic,
  easeOutBack,
  getVisibleWordCount,
  getWordProgress,
  type AnimationSpeed,
} from "../animation";

interface CaptionOverlayProps {
  scale?: number;
}

function CaptionOverlay({ scale = 1 }: CaptionOverlayProps) {
  const subtitles = useEditorStore((state) => state.subtitles);
  const currentTime = useEditorStore((state) => state.currentTime);
  const style = useEditorStore((state) => state.style);
  const animation = useEditorStore((state) => state.animation);
  const animationSpeed = useEditorStore((state) => state.animationSpeed);

  const activeSubtitle = subtitles.find(
    (subtitle) =>
      currentTime >= subtitle.startTime && currentTime < subtitle.endTime,
  );

  if (!activeSubtitle) {
    return null;
  }

  // ==================================================
  // SCALE
  // ==================================================

  const captionScale = Math.max(0.45, Math.min(scale, 1.5));

  const scaledFontSize = style.fontSize * captionScale;

  const scaledStrokeWidth = style.strokeWidth * captionScale;

  const scaledShadowBlur = style.shadowBlur * captionScale;

  // ==================================================
  // ANIMATION
  // ==================================================

  const entranceProgress = getAnimationProgress(
    currentTime,
    activeSubtitle.startTime,
    animationSpeed as AnimationSpeed,
  );

  const smoothProgress = easeOutCubic(entranceProgress);

  let opacity = 1;
  let animationScale = 1;
  let translateY = 0;

  switch (animation) {
    case "fade":
      opacity = smoothProgress;
      break;

    case "pop":
      animationScale = 0.75 + easeOutBack(entranceProgress) * 0.25;
      break;

    case "slideUp":
      translateY = (1 - smoothProgress) * 30 * captionScale;

      opacity = smoothProgress;
      break;

    case "bounce": {
      const bounceProgress = easeOutBack(entranceProgress);

      animationScale = 0.8 + bounceProgress * 0.2;

      opacity = smoothProgress;

      break;
    }

    case "none":
    case "typewriter":
    case "wordPop":
    case "karaoke":
    default:
      break;
  }

  // ==================================================
  // CAPTION WIDTH
  // ==================================================

  /*
   * maxWidth is a percentage of the actual video width.
   *
   * Example:
   *
   * maxWidth = 86
   *
   * means the caption can occupy 86% of the video width.
   */

  // ==================================================
  // COMMON STYLE
  // ==================================================

  const baseStyle: CSSProperties = {
    position: "absolute",

    /*
     * IMPORTANT:
     *
     * positionX represents the CENTER of the caption.
     *
     * So 50 = center of video.
     * 0 = extreme left.
     * 100 = extreme right.
     */
    left: `${style.positionX}%`,

    top: `${style.positionY}%`,

    width: `${style.maxWidth}%`,

    /*
     * Do NOT use maxWidth here as the primary sizing
     * mechanism. width is what gives wrapping a real box.
     */

    boxSizing: "border-box",

    fontFamily: style.fontFamily,

    fontSize: `${scaledFontSize}px`,

    fontWeight: style.fontWeight,

    lineHeight: 1.15,

    color: style.color,

    textAlign: style.textAlign,

    whiteSpace: "normal",

    overflowWrap: "break-word",

    wordBreak: "normal",

    WebkitTextStroke: `${scaledStrokeWidth}px ${style.strokeColor}`,

    textShadow: style.shadow
      ? `0 0 ${scaledShadowBlur}px ${style.shadowColor}`
      : "none",

    pointerEvents: "none",

    /*
     * Positioning is handled by the final animation
     * transform below.
     */
  };

  // ==================================================
  // TYPEWRITER
  // ==================================================

  if (animation === "typewriter") {
    const visibleCount = getVisibleWordCount(
      activeSubtitle.words.length,
      entranceProgress,
    );

    const visibleWords = activeSubtitle.words
      .slice(0, visibleCount)
      .map((word) => word.text);

    return (
      <div
        className="caption-overlay"
        style={{
          ...baseStyle,

          transform: "translate(-50%, -50%)",
        }}
      >
        {visibleWords.join(" ")}
      </div>
    );
  }

  // ==================================================
  // WORD POP
  // ==================================================

  if (animation === "wordPop") {
    return (
      <div
        className="caption-overlay caption-word-container"
        style={{
          ...baseStyle,

          transform: "translate(-50%, -50%)",
        }}
      >
        {activeSubtitle.words.map((word) => {
          const wordProgress = getWordProgress(
            currentTime,
            word.startTime,
            word.endTime,
          );

          const wordScale = 0.65 + easeOutBack(wordProgress) * 0.35;

          const wordOpacity = wordProgress;

          return (
            <span
              key={`${word.startTime}-${word.text}`}
              className="caption-word"
              style={{
                display: "inline-block",

                opacity: wordOpacity,

                transform: `scale(${wordScale})`,

                transformOrigin: "center bottom",

                marginRight: "0.25em",
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    );
  }

  // ==================================================
  // KARAOKE
  // ==================================================

  if (animation === "karaoke") {
    return (
      <div
        className="caption-overlay caption-word-container"
        style={{
          ...baseStyle,

          transform: "translate(-50%, -50%)",
        }}
      >
        {activeSubtitle.words.map((word) => {
          const wordProgress = getWordProgress(
            currentTime,
            word.startTime,
            word.endTime,
          );

          const spoken = currentTime >= word.endTime;

          const active =
            currentTime >= word.startTime && currentTime < word.endTime;

          let color = style.color;

          if (spoken || active) {
            color = style.karaokeColor;
          }

          return (
            <span
              key={`${word.startTime}-${word.text}`}
              className={
                active ? "caption-karaoke-word active" : "caption-karaoke-word"
              }
              style={{
                color,

                opacity: wordProgress > 0 || spoken ? 1 : 0.7,

                display: "inline",
              }}
            >
              {word.text}{" "}
            </span>
          );
        })}
      </div>
    );
  }

  // ==================================================
  // NORMAL CAPTION
  // ==================================================

  const animationStyle: CSSProperties = {
    ...baseStyle,

    opacity,

    transform:
      `translate(-50%, -50%) ` +
      `translateY(${translateY}px) ` +
      `scale(${animationScale})`,

    transition: "none",
  };

  return (
    <div className="caption-overlay" style={animationStyle}>
      {activeSubtitle.text}
    </div>
  );
}

export default CaptionOverlay;
