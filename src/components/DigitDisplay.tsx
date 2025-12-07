interface DigitDisplayProps {
  value: number;
}

export function DigitDisplay({ value }: DigitDisplayProps) {
  const clampedValue = Math.max(0, Math.min(999, value));
  const digits = String(clampedValue).padStart(3, "0").split("");

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
