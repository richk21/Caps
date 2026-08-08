interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div className="control-row">
      <label className="control-label">{label}</label>

      <div className="color-input">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />

        <span>{value.toUpperCase()}</span>
      </div>
    </div>
  );
}

export default ColorInput;
