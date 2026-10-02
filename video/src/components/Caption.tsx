import type React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { C, fontFamily } from "../theme";

const rise = (frame: number, at: number) => ({
  opacity: interpolate(frame, [at, at + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }),
  translate: interpolate(frame, [at, at + 20], ["0px 36px", "0px 0px"], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  }),
});

/** The left-hand text block beside the phone: step label, headline, one line of detail. */
export const Caption: React.FC<{
  readonly step: string;
  readonly title: string;
  readonly body: string;
  readonly children?: React.ReactNode;
}> = ({ step, title, body, children }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left: 140,
        top: 0,
        bottom: 0,
        width: 900,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 32,
        fontFamily,
        color: C.text,
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: C.accent700,
          ...rise(frame, 4),
        }}
      >
        {step}
      </div>
      <div
        style={{
          fontSize: 92,
          fontWeight: 800,
          lineHeight: 1.02,
          letterSpacing: "-0.025em",
          textWrap: "balance",
          ...rise(frame, 8),
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 44,
          lineHeight: 1.35,
          color: C.neutral800,
          maxWidth: 820,
          textWrap: "pretty",
          ...rise(frame, 14),
        }}
      >
        {body}
      </div>
      {children}
    </div>
  );
};

export const captionSchema = {
  step: { type: "text-content", default: "", description: "Step label" },
  title: { type: "text-content", default: "", description: "Headline" },
  body: { type: "text-content", default: "", description: "Detail line" },
} as const;
