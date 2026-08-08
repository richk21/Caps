import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";

import { useEditorStore } from "./store";

function ExportButton() {
  const videoPath = useEditorStore((state) => state.videoPath);

  const subtitles = useEditorStore((state) => state.subtitles);

  const style = useEditorStore((state) => state.style);

  const handleExport = async () => {
    console.log("========== EXPORT ==========");

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!videoPath) {
      alert("Please import a video first.");
      return;
    }

    if (!subtitles.length) {
      alert("There are no captions to export.");
      return;
    }

    try {
      // ------------------------------------------------
      // SAVE LOCATION
      // ------------------------------------------------

      const outputPath = await save({
        title: "Export Video",

        defaultPath: "caps-export.mp4",

        filters: [
          {
            name: "MP4 Video",
            extensions: ["mp4"],
          },
        ],
      });

      if (!outputPath) {
        console.log("Export cancelled.");
        return;
      }

      // ------------------------------------------------
      // SEND SUBTITLES AS JSON
      // ------------------------------------------------

      const subtitlesJson = JSON.stringify(subtitles);

      console.log("Subtitle count:", subtitles.length);

      console.log("Caption style:", style);

      // ------------------------------------------------
      // CALL RUST
      // ------------------------------------------------

      console.log("🎬 Starting FFmpeg export...");

      const result = await invoke<string>("export_video", {
        inputPath: videoPath,

        outputPath,

        subtitles: subtitlesJson,

        style,
      });

      console.log("✅ Export completed:", result);

      alert(`Export completed!\n\nSaved to:\n${result}`);
    } catch (error) {
      console.error("❌ EXPORT FAILED:", error);

      alert(`Export failed:\n\n${error}`);
    }
  };

  return (
    <button type="button" onClick={handleExport}>
      Export
    </button>
  );
}

export default ExportButton;
