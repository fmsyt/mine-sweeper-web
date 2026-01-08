interface DigitDisplayProps {
  value: number;
  digitCount?: number;
}

export function DigitDisplay(props: DigitDisplayProps) {
  const { value, digitCount = 3 } = props;

  const clampedValue = Math.max(0, Math.min(999, value));
  const digits = String(clampedValue).padStart(digitCount, "0").split("");

  return (
    <div className="digit-display">
      {digits.map((digit, index) => (
        <div
          key={`digit-${index}-${digit}`}
          className={`digit digit-${digit}`}
          role="img"
          aria-label={digit}
        />
      ))}
    </div>
  );
}
