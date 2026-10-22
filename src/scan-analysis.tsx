import { useEffect, useState } from "react";
import { Check, Leaf } from "lucide-react";
import { species } from "./data";
import { Button, Pill } from "./ui";
export function ScanAnalysis({
  id,
  photo,
  onCancel,
}: {
  id: number;
  photo?: string;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(0);
  const stages = [
    "Image Acquired",
    "Analysing Visual Features",
    "Examining Morphology",
    "Finding Possible Matches",
  ];
  useEffect(() => {
    const timer = setInterval(() => setStep((s) => Math.min(3, s + 1)), 500);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="analysis-overlay" role="status">
      <Pill>DEMO ANALYSIS · SCRIPTED SIMULATION</Pill>
      <div className="analysis-photo">
        <img
          src={photo || `/images/${id}.jpg`}
          alt={
            photo
              ? "Your photo · not automatically classified"
              : species[id].name
          }
        />
        <div className="analysis-sweep" />
        {!photo && id === 3 && (
          <svg
            viewBox="0 0 960 720"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <rect
              x="85"
              y="145"
              width="660"
              height="425"
              rx="100"
              fill="none"
              stroke="#d2f078"
              strokeWidth="2"
              strokeDasharray="9 9"
            />
          </svg>
        )}
      </div>
      <h2>
        {stages[step]}
        <span>…</span>
      </h2>
      <div className="analysis-steps">
        {stages.map((s, i) => (
          <span key={s} className={i <= step ? "done" : ""}>
            {i < step ? <Check size={13} /> : <Leaf size={13} />} {s}
          </span>
        ))}
      </div>
      <p>
        {photo
          ? "Your photo is retained. The selected example is not a classification of your image."
          : id === 3
            ? "Example features: blue abdominal bands · hairy thorax · wing structure."
            : "Illustrative feature comparison for your chosen sample."}
      </p>
      <p className="footnote">
        No trained model, confidence score or expert verification.
      </p>
      <Button secondary onClick={onCancel}>
        Cancel Demo Scan
      </Button>
    </div>
  );
}
