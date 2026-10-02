import type React from "react";
import { C } from "../theme";

/** The Spotr mark, copied from the app's components/Logo.tsx with the tokens resolved. */
export const LogoMark: React.FC<{
  readonly size: number;
  readonly parts?: readonly [number, number, number, number];
}> = ({ size, parts = [1, 1, 1, 1] }) => {
  const [top, bottom, dotA, dotB] = parts;
  return (
    <svg width={size} height={size} viewBox="0 0 400 400" fill="none" style={{ display: "block", flex: "none", overflow: "visible" }}>
      <g style={{ opacity: top, translate: `0px ${(1 - top) * -60}px` }}>
        <path d="M205 35 A85 85 0 0 0 205 205 Z" fill={C.full} />
      </g>
      <g style={{ opacity: bottom, translate: `0px ${(1 - bottom) * 60}px` }}>
        <path d="M205 205 A85 85 0 0 1 205 375 Z" fill={C.accent} />
        <rect x="196" y="300" width="18" height="92" rx="9" fill={C.accent} />
      </g>
      <circle cx="268" cy="121" r={30 * dotA} fill={C.few} />
      <circle cx="131" cy="291" r={30 * dotB} fill={C.text} />
    </svg>
  );
};
