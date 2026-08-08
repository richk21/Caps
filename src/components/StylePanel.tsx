import { useEditorStore } from "../store";
import AlignmentControl from "./AlignmentControl";

function StylePanel() {
  const style = useEditorStore((state) => state.style);

  const animation = useEditorStore((state) => state.animation);

  const setAnimation = useEditorStore((state) => state.setAnimation);

  const updateStyle = useEditorStore((state) => state.updateStyle);

  const animationSpeed = useEditorStore((state) => state.animationSpeed);

  const setAnimationSpeed = useEditorStore((state) => state.setAnimationSpeed);

  return (
    <div className="style-panel">
      {/* =========================
          TYPOGRAPHY
      ========================== */}

      <div className="style-section">
        <div className="style-section-title">Typography</div>

        <div className="style-label">Font Family</div>

        <select
          value={style.fontFamily}
          onChange={(event) =>
            updateStyle({
              fontFamily: event.target.value,
            })
          }
        >
          <option value="Arial">Arial</option>

          <option value="Arial Black">Arial Black</option>

          <option value="Impact">Impact</option>

          <option value="Georgia">Georgia</option>

          <option value="Verdana">Verdana</option>

          <option value="Trebuchet MS">Trebuchet MS</option>

          <option value="Courier New">Courier New</option>

          <option value="Times New Roman">Times New Roman</option>

          <option value="Helvetica">Helvetica</option>
        </select>
      </div>

      <div className="style-section">
        <div className="style-label-row">
          <div className="style-label">Font Size</div>

          <span>{style.fontSize}px</span>
        </div>

        <input
          type="range"
          min="24"
          max="120"
          value={style.fontSize}
          onChange={(event) =>
            updateStyle({
              fontSize: Number(event.target.value),
            })
          }
        />
      </div>

      <div className="style-section">
        <div className="style-label">Font Weight</div>

        <select
          value={style.fontWeight}
          onChange={(event) =>
            updateStyle({
              fontWeight: Number(event.target.value),
            })
          }
        >
          <option value="400">Regular</option>

          <option value="500">Medium</option>

          <option value="600">Semibold</option>

          <option value="700">Bold</option>

          <option value="800">Extra Bold</option>

          <option value="900">Black</option>
        </select>
      </div>

      {/* =========================
          APPEARANCE
      ========================== */}

      <div className="style-section">
        <div className="style-section-title">Appearance</div>

        <div className="style-label">Text Color</div>

        <div className="color-control">
          <input
            type="color"
            value={style.color}
            onChange={(event) =>
              updateStyle({
                color: event.target.value,
              })
            }
          />

          <span>{style.color.toUpperCase()}</span>
        </div>
      </div>

      {/* =========================
          ALIGNMENT
      ========================== */}

      <div className="style-section">
        <div className="style-section-title">Alignment</div>

        <AlignmentControl
          value={style.textAlign}
          onChange={(textAlign) =>
            updateStyle({
              textAlign,
            })
          }
        />
      </div>

      {/* =========================
          OUTLINE
      ========================== */}

      <div className="style-section">
        <div className="style-section-title">Outline</div>

        <div className="style-label">Outline Color</div>

        <div className="color-control">
          <input
            type="color"
            value={style.strokeColor}
            onChange={(event) =>
              updateStyle({
                strokeColor: event.target.value,
              })
            }
          />

          <span>{style.strokeColor.toUpperCase()}</span>
        </div>
      </div>

      <div className="style-section">
        <div className="style-label-row">
          <div className="style-label">Outline Width</div>

          <span>{style.strokeWidth}px</span>
        </div>

        <input
          type="range"
          min="0"
          max="15"
          step="1"
          value={style.strokeWidth}
          onChange={(event) =>
            updateStyle({
              strokeWidth: Number(event.target.value),
            })
          }
        />
      </div>

      {/* =========================
          SHADOW
      ========================== */}

      <div className="style-section">
        <div className="style-section-title">Shadow</div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={style.shadow}
            onChange={(event) =>
              updateStyle({
                shadow: event.target.checked,
              })
            }
          />

          <span>Enable Shadow</span>
        </label>
      </div>

      {style.shadow && (
        <>
          <div className="style-section">
            <div className="style-label">Shadow Color</div>

            <div className="color-control">
              <input
                type="color"
                value={style.shadowColor}
                onChange={(event) =>
                  updateStyle({
                    shadowColor: event.target.value,
                  })
                }
              />

              <span>{style.shadowColor.toUpperCase()}</span>
            </div>
          </div>

          <div className="style-section">
            <div className="style-label-row">
              <div className="style-label">Shadow Blur</div>

              <span>{style.shadowBlur}px</span>
            </div>

            <input
              type="range"
              min="0"
              max="30"
              value={style.shadowBlur}
              onChange={(event) =>
                updateStyle({
                  shadowBlur: Number(event.target.value),
                })
              }
            />
          </div>
        </>
      )}

      {/* =========================
          POSITION
      ========================== */}

      <div className="style-section">
        <div className="style-section-title">Position</div>

        <div className="style-label-row">
          <div className="style-label">Horizontal</div>

          <span>{style.positionX}%</span>
        </div>

        <input
          type="range"
          min="10"
          max="90"
          value={style.positionX}
          onChange={(event) =>
            updateStyle({
              positionX: Number(event.target.value),
            })
          }
        />
      </div>

      <div className="style-section">
        <div className="style-label-row">
          <div className="style-label">Vertical</div>

          <span>{style.positionY}%</span>
        </div>

        <input
          type="range"
          min="10"
          max="95"
          value={style.positionY}
          onChange={(event) =>
            updateStyle({
              positionY: Number(event.target.value),
            })
          }
        />
      </div>

      {/* =========================
          LAYOUT
      ========================== */}

      <div className="style-section">
        <div className="style-section-title">Layout</div>

        <div className="style-label-row">
          <div className="style-label">Maximum Width</div>

          <span>{style.maxWidth}%</span>
        </div>

        <input
          type="range"
          min="30"
          max="100"
          value={style.maxWidth}
          onChange={(event) =>
            updateStyle({
              maxWidth: Number(event.target.value),
            })
          }
        />
      </div>

      {/* =========================
          ANIMATION
      ========================== */}

      <div className="style-section">
        <div className="style-section-title">Animation</div>

        <div className="style-label">Appearance</div>

        <div className="animation-grid">
          <button
            type="button"
            className={
              animation === "none"
                ? "animation-option active"
                : "animation-option"
            }
            onClick={() => setAnimation("none")}
          >
            None
          </button>

          <button
            type="button"
            className={
              animation === "fade"
                ? "animation-option active"
                : "animation-option"
            }
            onClick={() => setAnimation("fade")}
          >
            Fade
          </button>

          <button
            type="button"
            className={
              animation === "pop"
                ? "animation-option active"
                : "animation-option"
            }
            onClick={() => setAnimation("pop")}
          >
            Pop
          </button>

          <button
            type="button"
            className={
              animation === "slideUp"
                ? "animation-option active"
                : "animation-option"
            }
            onClick={() => setAnimation("slideUp")}
          >
            Slide Up
          </button>

          <button
            type="button"
            className={
              animation === "bounce"
                ? "animation-option active"
                : "animation-option"
            }
            onClick={() => setAnimation("bounce")}
          >
            Bounce
          </button>

          <button
            type="button"
            className={
              animation === "typewriter"
                ? "animation-option active"
                : "animation-option"
            }
            onClick={() => setAnimation("typewriter")}
          >
            Typewriter
          </button>

          <button
            type="button"
            className={
              animation === "wordPop"
                ? "animation-option active"
                : "animation-option"
            }
            onClick={() => setAnimation("wordPop")}
          >
            Word Pop
          </button>

          <button
            type="button"
            className={
              animation === "karaoke"
                ? "animation-option active"
                : "animation-option"
            }
            onClick={() => setAnimation("karaoke")}
          >
            Karaoke
          </button>
        </div>
      </div>

      {/* =========================
          KARAOKE
      ========================== */}

      {animation === "karaoke" && (
        <div className="style-section">
          <div className="style-section-title">Karaoke</div>

          <div className="style-label">Highlight Color</div>

          <div className="color-control">
            <input
              type="color"
              value={style.karaokeColor}
              onChange={(event) =>
                updateStyle({
                  karaokeColor: event.target.value,
                })
              }
            />

            <span>{style.karaokeColor.toUpperCase()}</span>
          </div>
        </div>
      )}

      {/* =========================
          ANIMATION SPEED
      ========================== */}

      <div className="style-section">
        <div className="style-label">Animation Speed</div>

        <div className="segmented-control">
          {(["slow", "normal", "fast"] as const).map((speed) => (
            <button
              key={speed}
              type="button"
              className={animationSpeed === speed ? "active" : ""}
              onClick={() => setAnimationSpeed(speed)}
            >
              {speed.charAt(0).toUpperCase() + speed.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StylePanel;
