import type React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";

/** A finger tap at (x, y) in screenshot pixels, landing on frame `at`. */
export const Tap: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly at: number;
}> = ({ x, y, at }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < -8 || t > 22) return null;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - 70,
          top: y - 70,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "rgba(32, 30, 29, 0.28)",
          border: "6px solid rgba(255, 255, 255, 0.9)",
          opacity: interpolate(t, [-8, -2, 8, 16], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(t, [-8, 0, 4], [1.4, 0.85, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x - 70,
          top: y - 70,
          width: 140,
          height: 140,
          borderRadius: "50%",
          border: `8px solid ${C.accent}`,
          opacity: interpolate(t, [0, 22], [0.9, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(t, [0, 22], [1, 2.4], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />
    </>
  );
};

/** An outline drawn around a region of the screenshot from frame `at`. */
export const Highlight: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly at: number;
  readonly color?: string;
}> = ({ x, y, w, h, at, color = C.accent }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 28,
        border: `9px solid ${color}`,
        boxShadow: "0 0 0 9999px rgba(32, 30, 29, 0.18)",
        opacity: interpolate(frame, [at, at + 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(frame, [at, at + 14], [1.12, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    />
  );
};
