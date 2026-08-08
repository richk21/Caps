import { open } from "@tauri-apps/plugin-dialog";
import { convertFileSrc } from "@tauri-apps/api/core";

import { useEditorStore } from "../store";

function VideoImporter() {
  const setVideo = useEditorStore((state) => state.setVideo);

  const handleImportVideo = async () => {
    console.log("========== VIDEO IMPORT ==========");

    try {
      const selected = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: "Video",
            extensions: ["mp4", "mov", "webm", "mkv", "avi"],
          },
        ],
      });

      console.log("Selected:", selected);

      if (!selected || Array.isArray(selected)) {
        console.log("No video selected.");
        return;
      }

      const videoPath = selected;

      console.log("📁 Local path:", videoPath);

      const videoUrl = convertFileSrc(videoPath);

      console.log("🎬 Asset URL:", videoUrl);

      setVideo(videoPath, videoUrl);

      console.log("========== VIDEO IMPORT COMPLETE ==========");
    } catch (error) {
      console.error("❌ VIDEO IMPORT ERROR:", error);
    }
  };

  return (
    <button type="button" onClick={handleImportVideo}>
      Import Video
    </button>
  );
}

export default VideoImporter;
