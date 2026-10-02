import type React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  type InteractivitySchema,
} from "remotion";
import { LogoMark } from "../components/Logo";
import { C, fontFamily } from "../theme";

const pop = (frame: number, at: number) =>
  interpolate(frame, [at, at + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 14 }),
  });

type HookProps = {
  readonly line1: string;
  readonly line2: string;
  readonly style?: React.CSSProperties;
};

const HookInner: React.FC<HookProps> = ({ line1, line2, style }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        justifyContent: "center",
        padding: "0 160px",
        gap: 24,
        fontFamily,
        color: C.text,
        ...style,
      }}
    >
      <div
        style={{
          fontSize: 136,
          fontWeight: 800,
          letterSpacing: "-0.035em",
          lineHeight: 1,
          opacity: interpolate(frame, [6, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          translate: interpolate(frame, [6, 28], ["0px 40px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {line1}
      </div>
      <div
        style={{
          fontSize: 136,
          fontWeight: 800,
          letterSpacing: "-0.035em",
          lineHeight: 1,
          color: C.full,
          opacity: interpolate(frame, [46, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          translate: interpolate(frame, [46, 68], ["0px 40px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {line2}
      </div>
    </AbsoluteFill>
  );
};

export const Hook = Interactive.withSchema({
  Component: HookInner,
  componentName: "<Hook>",
  schema: {
    line1: { type: "text-content", default: "", description: "First line" },
    line2: { type: "text-content", default: "", description: "Second line" },
  } as const satisfies InteractivitySchema,
  wrapInSequence: true,
});

type TitleProps = {
  readonly tagline: string;
  readonly style?: React.CSSProperties;
};

const TitleInner: React.FC<TitleProps> = ({ tagline, style }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        justifyContent: "center",
        alignItems: "center",
        gap: 48,
        fontFamily,
        color: C.text,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        <LogoMark
          size={260}
          parts={[pop(frame, 4), pop(frame, 10), pop(frame, 18), pop(frame, 22)]}
        />
        <div
          style={{
            fontSize: 220,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            opacity: interpolate(frame, [20, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [20, 40], ["-30px 0px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          spotr
        </div>
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 600,
          letterSpacing: "-0.015em",
          color: C.neutral800,
          opacity: interpolate(frame, [42, 56], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          translate: interpolate(frame, [42, 62], ["0px 24px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {tagline}
      </div>
    </AbsoluteFill>
  );
};

export const Title = Interactive.withSchema({
  Component: TitleInner,
  componentName: "<Title>",
  schema: {
    tagline: { type: "text-content", default: "", description: "Tagline" },
  } as const satisfies InteractivitySchema,
  wrapInSequence: true,
});

type OutroProps = {
  readonly headline: string;
  readonly url: string;
  readonly footnote: string;
  readonly style?: React.CSSProperties;
};

const SHOT_W = 1040;
const SHOT_H = Math.round((SHOT_W * 1800) / 2880);

const OutroInner: React.FC<OutroProps> = ({ headline, url, footnote, style }) => {
  const frame = useCurrentFrame();
  const fadeUp = (at: number) => ({
    opacity: interpolate(frame, [at, at + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    translate: interpolate(frame, [at, at + 22], ["0px 30px", "0px 0px"], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }),
  });

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily, color: C.text, ...style }}>
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 0,
          bottom: 0,
          width: 640,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 36,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, ...fadeUp(4) }}>
          <LogoMark size={110} />
          <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: "-0.04em" }}>spotr</div>
        </div>
        <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.025em", ...fadeUp(12) }}>
          {headline}
        </div>
        <div style={{ fontSize: 42, fontWeight: 700, color: C.accent, whiteSpace: "nowrap", ...fadeUp(22) }}>{url}</div>
        <div style={{ fontSize: 34, color: C.neutral700, ...fadeUp(30) }}>{footnote}</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 820,
          top: (1080 - SHOT_H - 52) / 2,
          width: SHOT_W,
          borderRadius: 20,
          overflow: "hidden",
          background: "#dedcdc",
          boxShadow: "0 40px 80px rgba(45, 43, 43, 0.25), 0 8px 20px rgba(45, 43, 43, 0.15)",
          opacity: interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          translate: interpolate(frame, [0, 30], ["80px 0px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <div style={{ height: 52, display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: C.full }} />
          <div style={{ width: 14, height: 14, borderRadius: 7, background: C.few }} />
          <div style={{ width: 14, height: 14, borderRadius: 7, background: C.ok }} />
          <div
            style={{
              marginLeft: 20,
              flex: 1,
              height: 30,
              borderRadius: 15,
              background: C.bg,
              fontSize: 17,
              color: C.neutral700,
              display: "flex",
              alignItems: "center",
              paddingLeft: 16,
            }}
          >
            {url}
          </div>
        </div>
        <Img src={staticFile("shots/11-desktop.png")} style={{ display: "block", width: SHOT_W, height: SHOT_H }} />
      </div>
    </AbsoluteFill>
  );
};

export const Outro = Interactive.withSchema({
  Component: OutroInner,
  componentName: "<Outro>",
  schema: {
    headline: { type: "text-content", default: "", description: "Headline" },
    url: { type: "text-content", default: "", description: "URL" },
    footnote: { type: "text-content", default: "", description: "Footnote" },
  } as const satisfies InteractivitySchema,
  wrapInSequence: true,
});
