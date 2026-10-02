import type React from "react";
import { Img, staticFile } from "remotion";
import { SHOT_H, SHOT_W } from "../theme";

export const SCREEN_W = 444;
export const SCREEN_H = Math.round((SCREEN_W * SHOT_H) / SHOT_W);
const BEZEL = 16;
// Children are laid out in screenshot pixels (1170 wide) and scaled down here,
// so tap and highlight positions can be read straight off the captures.
const K = SCREEN_W / SHOT_W;

export const Phone: React.FC<{
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ children, style }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 1220,
        top: (1080 - SCREEN_H - BEZEL * 2) / 2,
        padding: BEZEL,
        borderRadius: 72,
        background: "#1b1a19",
        boxShadow:
          "0 40px 80px rgba(45, 43, 43, 0.28), 0 8px 20px rgba(45, 43, 43, 0.18)",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          width: SCREEN_W,
          height: SCREEN_H,
          borderRadius: 56,
          overflow: "hidden",
          background: "#f3f2f2",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: SHOT_W,
            height: SHOT_H,
            scale: String(K),
            transformOrigin: "0 0",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

/** One app screenshot inside the phone, scrolled by `scrollY` screenshot px. */
export const Shot: React.FC<{
  readonly src: string;
  readonly scrollY?: number;
  readonly opacity?: number;
}> = ({ src, scrollY = 0, opacity = 1 }) => {
  return (
    <Img
      src={staticFile(`shots/${src}.png`)}
      style={{
        position: "absolute",
        left: 0,
        top: -scrollY,
        width: SHOT_W,
        opacity,
      }}
    />
  );
};
