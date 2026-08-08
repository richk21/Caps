import { useRef } from "react";

import { parseSrt } from "../core/srt";
import { useEditorStore } from "../store";

function SrtImporter() {
  const inputRef = useRef<HTMLInputElement>(null);

  const setSrt = useEditorStore((state) => state.setSrt);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const contents = await file.text();

      const subtitles = parseSrt(contents);

      if (subtitles.length === 0) {
        alert("No valid subtitles were found in this SRT file.");

        return;
      }

      setSrt(file.name, subtitles);

      console.log(`Imported ${subtitles.length} subtitle blocks`);

      console.log("Imported subtitles:", subtitles);
    } catch (error) {
      console.error("Failed to parse SRT:", error);

      alert("Could not read this SRT file.");
    }

    event.target.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".srt"
        onChange={handleFileChange}
        hidden
      />

      <button onClick={() => inputRef.current?.click()}>Import SRT</button>
    </>
  );
}

export default SrtImporter;
