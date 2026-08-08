interface RangeControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

function RangeControl({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: RangeControlProps) {
  return (
    <div className="range-control">
      <div className="range-control-header">
        <label>{label}</label>

        <span>{value}</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

export default RangeControl;
