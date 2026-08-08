export type AnimationType =
  | "none"
  | "fade"
  | "pop"
  | "slideUp"
  | "bounce"
  | "typewriter"
  | "wordPop"
  | "karaoke";

export type AnimationSpeed = "slow" | "normal" | "fast";

export interface SubtitleWord {
  text: string;
  startTime: number;
  endTime: number;
}

export interface CaptionStyle {
  fontFamily: string;

  fontSize: number;

  fontWeight: number;

  color: string;

  strokeColor: string;

  strokeWidth: number;

  shadow: boolean;

  shadowColor: string;

  shadowBlur: number;

  positionX: number;

  positionY: number;

  maxWidth: number;

  karaokeColor: string;

  textAlign: "left" | "center" | "right";
}

export interface Subtitle {
  id: string;

  startTime: number;

  endTime: number;

  text: string;

  words: SubtitleWord[];
}

export const defaultStyle: CaptionStyle = {
  fontFamily: "Arial",

  fontSize: 64,

  fontWeight: 700,

  color: "#ffffff",

  strokeColor: "#000000",

  strokeWidth: 5,

  shadow: true,

  shadowColor: "#000000",

  shadowBlur: 8,

  positionX: 50,

  positionY: 82,

  maxWidth: 86,

  textAlign: "center",

  karaokeColor: "#ffff00",
};
