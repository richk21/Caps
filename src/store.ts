import { create } from "zustand";

import type {
  AnimationSpeed,
  AnimationType,
  CaptionStyle,
  Subtitle,
} from "./types";
import { defaultStyle } from "./types";

interface EditorState {
  videoPath: string | null;

  videoUrl: string | null;

  videoElement: HTMLVideoElement | null;

  srtPath: string | null;

  subtitles: Subtitle[];

  currentTime: number;

  duration: number;

  selectedSubtitleId: string | null;

  style: CaptionStyle;

  animation: AnimationType;

  animationSpeed: AnimationSpeed;

  setVideo: (path: string, url: string) => void;

  setSrt: (path: string, subtitles: Subtitle[]) => void;

  setVideoElement: (element: HTMLVideoElement | null) => void;

  setCurrentTime: (time: number) => void;

  setDuration: (duration: number) => void;

  selectSubtitle: (id: string | null) => void;

  updateStyle: (patch: Partial<CaptionStyle>) => void;

  setAnimation: (animation: AnimationType) => void;

  setAnimationSpeed: (speed: AnimationSpeed) => void;

  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  videoPath: null,

  videoUrl: null,

  videoElement: null,

  srtPath: null,

  subtitles: [],

  currentTime: 0,

  duration: 0,

  selectedSubtitleId: null,

  style: defaultStyle,

  animation: "pop",

  animationSpeed: "normal",

  setVideo: (videoPath, videoUrl) =>
    set({
      videoPath,
      videoUrl,
    }),

  setSrt: (srtPath, subtitles) =>
    set({
      srtPath,
      subtitles,
      selectedSubtitleId: subtitles[0]?.id ?? null,
    }),

  setCurrentTime: (currentTime) =>
    set({
      currentTime,
    }),

  setDuration: (duration) =>
    set({
      duration,
    }),

  selectSubtitle: (selectedSubtitleId) =>
    set({
      selectedSubtitleId,
    }),

  updateStyle: (patch) =>
    set((state) => ({
      style: {
        ...state.style,
        ...patch,
      },
    })),

  setAnimation: (animation) =>
    set({
      animation,
    }),

  setVideoElement: (videoElement) =>
    set({
      videoElement,
    }),

  setAnimationSpeed: (animationSpeed) =>
    set({
      animationSpeed,
    }),

  reset: () =>
    set({
      videoPath: null,

      videoUrl: null,

      srtPath: null,

      subtitles: [],

      currentTime: 0,

      duration: 0,

      selectedSubtitleId: null,

      style: defaultStyle,

      animation: "pop",

      animationSpeed: "normal",
    }),
}));
