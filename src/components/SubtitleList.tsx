import { useEditorStore } from "../store";
import { formatTime } from "../core/srt";

function SubtitleList() {
  const subtitles = useEditorStore((state) => state.subtitles);

  const selectedSubtitleId = useEditorStore(
    (state) => state.selectedSubtitleId,
  );

  const selectSubtitle = useEditorStore((state) => state.selectSubtitle);

  if (subtitles.length === 0) {
    return <div className="subtitle-empty">No subtitles imported yet.</div>;
  }

  return (
    <div className="subtitle-list">
      {subtitles.map((subtitle) => {
        const isSelected = subtitle.id === selectedSubtitleId;

        return (
          <button
            key={subtitle.id}
            className={`subtitle-item ${isSelected ? "selected" : ""}`}
            onClick={() => selectSubtitle(subtitle.id)}
          >
            <div className="subtitle-time">
              {formatTime(subtitle.startTime)}

              {" → "}

              {formatTime(subtitle.endTime)}
            </div>

            <div className="subtitle-text">{subtitle.text}</div>
          </button>
        );
      })}
    </div>
  );
}

export default SubtitleList;
