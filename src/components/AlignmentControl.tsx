import type { CaptionStyle } from "../types";

interface AlignmentControlProps {
  value: CaptionStyle["textAlign"];

  onChange: (value: CaptionStyle["textAlign"]) => void;
}

function AlignmentControl({ value, onChange }: AlignmentControlProps) {
  return (
    <div className="alignment-control">
      <label className="control-label">Text Alignment</label>

      <div className="alignment-buttons">
        <button
          type="button"
          className={value === "left" ? "active" : ""}
          onClick={() => onChange("left")}
          aria-label="Align left"
        >
          ☰
        </button>

        <button
          type="button"
          className={value === "center" ? "active" : ""}
          onClick={() => onChange("center")}
          aria-label="Align center"
        >
          ☷
        </button>

        <button
          type="button"
          className={value === "right" ? "active" : ""}
          onClick={() => onChange("right")}
          aria-label="Align right"
        >
          ☰
        </button>
      </div>
    </div>
  );
}

export default AlignmentControl;
