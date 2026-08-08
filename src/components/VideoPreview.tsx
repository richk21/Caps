import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { useEditorStore } from "../store";
import CaptionOverlay from "./CaptionOverlay";

function VideoPreview() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [videoError, setVideoError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  const [videoDimensions, setVideoDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [stageSize, setStageSize] = useState({
    width: 0,
    height: 0,
  });

  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoUrl = useEditorStore((state) => state.videoUrl);
  const videoPath = useEditorStore((state) => state.videoPath);

  const setVideoElement = useEditorStore((state) => state.setVideoElement);

  const setCurrentTime = useEditorStore((state) => state.setCurrentTime);

  const setDuration = useEditorStore((state) => state.setDuration);

  const videoMimeType = useMemo(() => {
    const extension = videoPath?.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "mp4":
        return "video/mp4";

      case "webm":
        return "video/webm";

      case "mov":
        return "video/quicktime";

      case "mkv":
        return "video/x-matroska";

      case "avi":
        return "video/x-msvideo";

      default:
        return undefined;
    }
  }, [videoPath]);

  // ==================================================
  // LOAD TAURI ASSET -> BLOB URL
  // ==================================================

  useEffect(() => {
    if (!videoUrl) {
      setBlobUrl(null);
      setVideoError(null);
      setLoadingVideo(false);

      setVideoDimensions({
        width: 0,
        height: 0,
      });

      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    const loadVideo = async () => {
      setLoadingVideo(true);
      setVideoError(null);
      setBlobUrl(null);

      setVideoDimensions({
        width: 0,
        height: 0,
      });

      try {
        const response = await fetch(videoUrl);

        if (!response.ok) {
          throw new Error(`Failed to read video file (${response.status})`);
        }

        const blob = await response.blob();

        if (blob.size === 0) {
          throw new Error("The selected video file is empty.");
        }

        if (cancelled) {
          return;
        }

        const mediaBlob =
          blob.type || !videoMimeType
            ? blob
            : new Blob([blob], {
                type: videoMimeType,
              });

        objectUrl = URL.createObjectURL(mediaBlob);

        if (!cancelled) {
          setBlobUrl(objectUrl);
        }
      } catch (error) {
        console.error("❌ VIDEO LOAD FAILED:", error);

        if (!cancelled) {
          setVideoError(
            error instanceof Error ? error.message : "Unable to load video.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingVideo(false);
        }
      }
    };

    loadVideo();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [videoUrl, videoPath, videoMimeType]);

  // ==================================================
  // VIDEO ELEMENT
  // ==================================================

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    setVideoElement(video);

    if (!blobUrl) {
      return;
    }

    const handleLoadedMetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;

      console.log("🎬 Video dimensions:", {
        width,
        height,
        aspectRatio: width / height,
      });

      setVideoDimensions({
        width,
        height,
      });

      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleError = () => {
      const error = video.error;

      console.error("❌ VIDEO ELEMENT ERROR", {
        src: video.src,
        currentSrc: video.currentSrc,
        errorCode: error?.code,
        errorMessage: error?.message,
        readyState: video.readyState,
        networkState: video.networkState,
      });

      setVideoError(
        error?.message ||
          `Video playback failed. Media error code: ${
            error?.code ?? "unknown"
          }`,
      );
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    video.addEventListener("timeupdate", handleTimeUpdate);

    video.addEventListener("error", handleError);

    video.src = blobUrl;
    video.load();

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);

      video.removeEventListener("timeupdate", handleTimeUpdate);

      video.removeEventListener("error", handleError);

      setVideoElement(null);
    };
  }, [blobUrl, setVideoElement, setCurrentTime, setDuration]);

  // ==================================================
  // CALCULATE VIDEO DISPLAY SIZE
  // ==================================================

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !videoDimensions.width || !videoDimensions.height) {
      return;
    }

    const calculateSize = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      if (!containerWidth || !containerHeight) {
        return;
      }

      const videoAspect = videoDimensions.width / videoDimensions.height;

      const containerAspect = containerWidth / containerHeight;

      let width: number;
      let height: number;

      /*
       * Wide video:
       *
       * Fill available width.
       */
      if (videoAspect >= containerAspect) {
        width = containerWidth;
        height = width / videoAspect;
      } else {
        /*
         * Portrait / reel video:
         *
         * Fill available height.
         */
        height = containerHeight;
        width = height * videoAspect;
      }

      setStageSize({
        width,
        height,
      });
    };

    calculateSize();

    const observer = new ResizeObserver(calculateSize);

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [videoDimensions, isFullscreen]);

  // ==================================================
  // FULLSCREEN
  // ==================================================

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen((current) => !current);
  };

  // ==================================================
  // EMPTY STATE
  // ==================================================

  if (!videoUrl) {
    return (
      <div className="video-empty">
        <div>
          <strong>Import a video</strong>
          <span>Your video preview will appear here.</span>
        </div>
      </div>
    );
  }

  // ==================================================
  // LOADING STATE
  // ==================================================

  if (loadingVideo) {
    return (
      <div className="video-empty">
        <div>
          <strong>Loading video...</strong>
          <span>Reading the selected video file.</span>
        </div>
      </div>
    );
  }

  // ==================================================
  // STAGE STYLE
  // ==================================================

  const stageStyle: CSSProperties = {
    width: stageSize.width > 0 ? `${stageSize.width}px` : undefined,

    height: stageSize.height > 0 ? `${stageSize.height}px` : undefined,
  };

  /*
   * Caption scale:
   *
   * We treat 1080px video width as the reference size.
   *
   * Example:
   * 1080px video -> scale 1
   * 540px video  -> scale 0.5
   * 720px video  -> scale 0.667
   */
  const captionScale = stageSize.width > 0 ? stageSize.width / 1080 : 1;

  const containerClassName = isFullscreen
    ? "video-container video-container-fullscreen"
    : "video-container";

  return (
    <div ref={containerRef} className={containerClassName}>
      <div ref={stageRef} className="video-stage" style={stageStyle}>
        <video
          ref={videoRef}
          className="video-player"
          controls
          controlsList="nofullscreen nodownload noremoteplayback"
          disablePictureInPicture
          playsInline
          muted
          preload="metadata"
        />

        {videoError ? (
          <div className="video-error">
            <strong>Video playback failed:</strong>

            <p>{videoError}</p>
          </div>
        ) : null}

        <CaptionOverlay scale={captionScale} />

        {/* ==========================================
            CUSTOM FULLSCREEN BUTTON
            ========================================== */}

        <button
          type="button"
          className="video-fullscreen-button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? "⤢" : "⛶"}
        </button>

        {isFullscreen ? (
          <button
            type="button"
            className="video-exit-fullscreen"
            onClick={() => setIsFullscreen(false)}
          >
            Exit fullscreen
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default VideoPreview;
