import { save } from "@tauri-apps/plugin-dialog";

export async function chooseExportPath(): Promise<string | null> {
  const path = await save({
    title: "Export Video",
    defaultPath: "caps-export.mp4",
    filters: [
      {
        name: "MP4 Video",
        extensions: ["mp4"],
      },
    ],
  });

  return path;
}
