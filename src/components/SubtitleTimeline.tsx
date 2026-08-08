import { useMemo } from "react";

import { useEditorStore } from "../store";

function SubtitleTimeline() {
  const subtitles = useEditorStore((state) => state.subtitles);

  const currentTime = useEditorStore((state) => state.currentTime);

  const duration = useEditorStore((state) => state.duration);

  const videoElement = useEditorStore((state) => state.videoElement);

  const selectedSubtitleId = useEditorStore(
    (state) => state.selectedSubtitleId,
  );

  const selectSubtitle = useEditorStore((state) => state.selectSubtitle);

  const timelineDuration = Math.max(
    duration,
    subtitles.length ? subtitles[subtitles.length - 1].endTime : 0,
    1,
  );

  const markers = useMemo(() => {
    const count = 5;

    return Array.from(
      { length: count + 1 },
      (_, index) => (timelineDuration / count) * index,
    );
  }, [timelineDuration]);

  const handleSubtitleClick = (subtitleId: string, startTime: number) => {
    selectSubtitle(subtitleId);

    if (videoElement) {
      videoElement.currentTime = startTime;
    }
  };

  const playheadPosition = (currentTime / timelineDuration) * 100;

  return (
    <div className="subtitle-timeline">
      <div className="timeline-header">
        <span>Timeline</span>

        <span>{subtitles.length} subtitles</span>
      </div>

      <div className="timeline-track">
        <div className="timeline-ruler">
          {markers.map((time) => (
            <div
              key={time}
              className="timeline-marker"
              style={{
                left: `${((time / timelineDuration) * 100).toFixed(3)}%`,
              }}
            >
              <span>{time.toFixed(1)}s</span>
            </div>
          ))}
        </div>

        <div className="timeline-subtitles">
          {subtitles.map((subtitle) => {
            const left = (subtitle.startTime / timelineDuration) * 100;

            const width =
              ((subtitle.endTime - subtitle.startTime) / timelineDuration) *
              100;

            const isSelected = subtitle.id === selectedSubtitleId;

            return (
              <button
                key={subtitle.id}
                type="button"
                className={
                  isSelected
                    ? "timeline-subtitle selected"
                    : "timeline-subtitle"
                }
                style={{
                  left: `${left}%`,
                  width: `${Math.max(width, 2)}%`,
                }}
                onClick={() =>
                  handleSubtitleClick(subtitle.id, subtitle.startTime)
                }
                title={subtitle.text}
              >
                <span>{subtitle.text}</span>
              </button>
            );
          })}
        </div>

        <div
          className="timeline-playhead"
          style={{
            left: `${Math.min(Math.max(playheadPosition, 0), 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

export default SubtitleTimeline;
