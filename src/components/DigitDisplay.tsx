import d0Img from "../assets/game/d0.svg";
import d1Img from "../assets/game/d1.svg";
import d2Img from "../assets/game/d2.svg";
import d3Img from "../assets/game/d3.svg";
import d4Img from "../assets/game/d4.svg";
import d5Img from "../assets/game/d5.svg";
import d6Img from "../assets/game/d6.svg";
import d7Img from "../assets/game/d7.svg";
import d8Img from "../assets/game/d8.svg";
import d9Img from "../assets/game/d9.svg";

const digitImages = [
  d0Img,
  d1Img,
  d2Img,
  d3Img,
  d4Img,
  d5Img,
  d6Img,
  d7Img,
  d8Img,
  d9Img,
];

interface DigitDisplayProps {
  value: number;
}

export function DigitDisplay({ value }: DigitDisplayProps) {
  const clampedValue = Math.max(0, Math.min(999, value));
  const digits = String(clampedValue).padStart(3, "0").split("");

  return (
    <div className="digit-display">
      {digits.map((digit, index) => (
        <img
          key={`digit-${index}-${digit}`}
          src={digitImages[Number.parseInt(digit, 10)].src}
          alt={digit}
          className="digit"
        />
      ))}
    </div>
  );
}
