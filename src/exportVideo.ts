import { Command } from "@tauri-apps/plugin-shell";

export interface ExportCaption {
  text: string;
  startTime: number;
  endTime: number;
}

export interface ExportVideoOptions {
  inputPath: string;
  outputPath: string;
  captions: ExportCaption[];
}

function escapeSubtitleText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\n/g, "\\N");
}

function formatAssTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor((seconds % 3600) / 60);

  const remainingSeconds = seconds % 60;

  const centiseconds = Math.floor((remainingSeconds % 1) * 100);

  const secs = Math.floor(remainingSeconds);

  return `${hours}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${centiseconds
    .toString()
    .padStart(2, "0")}`;
}

function buildAssFile(captions: ExportCaption[]): string {
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,64,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,4,2,5,40,40,40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = captions.map((caption) => {
    const start = formatAssTime(caption.startTime);
    const end = formatAssTime(caption.endTime);

    const text = escapeSubtitleText(caption.text);

    return `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`;
  });

  return header + events.join("\n");
}

export async function exportVideo({
  inputPath,
  outputPath,
  captions,
}: ExportVideoOptions): Promise<void> {
  const assContent = buildAssFile(captions);

  console.log("ASS subtitle file:");
  console.log(assContent);

  /*
   * This is the next piece we'll connect to the filesystem.
   *
   * For now this function demonstrates the complete caption
   * representation we are going to send to FFmpeg.
   */

  console.log("Export requested:", {
    inputPath,
    outputPath,
    captions,
  });

  const command = Command.sidecar("binaries/ffmpeg");

  command.on("close", (data) => {
    console.log("FFmpeg finished:", data);
  });

  command.on("error", (error) => {
    console.error("FFmpeg error:", error);
  });

  command.stdout.on("data", (line) => {
    console.log("FFmpeg:", line);
  });

  command.stderr.on("data", (line) => {
    console.log("FFmpeg:", line);
  });

  /*
   * We aren't executing yet because the ASS file needs
   * to be written to disk first.
   */

  console.log("FFmpeg sidecar ready:", command);
}
