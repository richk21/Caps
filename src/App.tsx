import SrtImporter from "./components/SrtImporter";
import VideoImporter from "./components/VideoImporter";
import VideoPreview from "./components/VideoPreview";
import StylePanel from "./components/StylePanel";
import SubtitleTimeline from "./components/SubtitleTimeline";
import ExportButton from "./ExportButton";
import { useEditorStore } from "./store";

function App() {
  const video = useEditorStore((state) => state.videoPath);
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">Caps</div>

        <div className="topbar-actions">
          <VideoImporter />
          {video && <ExportButton />}
          <SrtImporter />
        </div>
      </header>

      <main className="editor-layout">
        <section className="editor-main">
          <div className="preview-panel">
            <VideoPreview />
          </div>

          <SubtitleTimeline />
        </section>

        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Caption Style</h2>

            <span>Changes apply to all subtitles</span>
          </div>

          <StylePanel />
        </aside>
      </main>
    </div>
  );
}

export default App;
