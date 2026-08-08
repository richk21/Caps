import type { Subtitle, SubtitleWord } from "../types";

function timestampToSeconds(value: string): number {
  const match = value
    .trim()
    .replace(".", ",")
    .match(/^(?:(\d+):)?(\d{2}):(\d{2}),(\d{3})$/);

  if (!match) {
    throw new Error(`Invalid SRT timestamp: ${value}`);
  }

  const hours = Number(match[1] ?? 0);

  const minutes = Number(match[2]);

  const seconds = Number(match[3]);

  const milliseconds = Number(match[4]);

  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

function estimateWordTimings(
  text: string,
  startTime: number,
  endTime: number,
): SubtitleWord[] {
  const words = text.trim().split(/\s+/).filter(Boolean);

  if (!words.length) {
    return [];
  }

  const totalWeight = words.reduce(
    (sum, word) =>
      sum + Math.max(1, word.replace(/[^\p{L}\p{N}]/gu, "").length),
    0,
  );

  const duration = Math.max(0.01, endTime - startTime);

  let cursor = startTime;

  return words.map((word, index) => {
    const weight = Math.max(1, word.replace(/[^\p{L}\p{N}]/gu, "").length);

    const part = duration * (weight / totalWeight);

    const wordStart = cursor;

    const wordEnd = index === words.length - 1 ? endTime : cursor + part;

    cursor = wordEnd;

    return {
      text: word,

      startTime: wordStart,

      endTime: wordEnd,
    };
  });
}

export function parseSrt(input: string): Subtitle[] {
  const normalized = input
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  if (!normalized) {
    return [];
  }

  const blocks = normalized.split(/\n\s*\n/).filter(Boolean);

  const result: Subtitle[] = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      continue;
    }

    const timingIndex = lines.findIndex((line) => line.includes("-->"));

    if (timingIndex === -1) {
      continue;
    }

    const timingLine = lines[timingIndex];

    const timingParts = timingLine.split("-->");

    if (timingParts.length !== 2) {
      continue;
    }

    try {
      const startTime = timestampToSeconds(
        timingParts[0].trim().split(/\s+/)[0],
      );

      const endTime = timestampToSeconds(timingParts[1].trim().split(/\s+/)[0]);

      const text = lines
        .slice(timingIndex + 1)
        .join(" ")
        .trim();

      if (!text) {
        continue;
      }

      if (endTime <= startTime) {
        continue;
      }

      const subtitle: Subtitle = {
        id: `subtitle-${result.length + 1}`,

        startTime,

        endTime,

        text,

        words: estimateWordTimings(text, startTime, endTime),
      };

      result.push(subtitle);
    } catch (error) {
      console.warn("Skipping malformed subtitle block:", block, error);
    }
  }

  return result;
}

export function formatTime(seconds: number): string {
  const safe = Math.max(0, seconds);

  const minutes = Math.floor(safe / 60);

  const secs = Math.floor(safe % 60);

  const ms = Math.floor((safe % 1) * 1000);

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
    2,
    "0",
  )}.${String(ms).padStart(3, "0")}`;
}
