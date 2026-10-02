import type React from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  type InteractivitySchema,
} from "remotion";
import { Caption, captionSchema } from "../components/Caption";
import { Phone, Shot } from "../components/Phone";
import { Highlight, Tap } from "../components/Tap";
import { C, fontFamily } from "../theme";

// Every position below is in screenshot pixels (1170 x 2532), read off the
// captures in public/shots.

type SceneProps = {
  readonly step: string;
  readonly title: string;
  readonly body: string;
  readonly style?: React.CSSProperties;
};

const schema = captionSchema satisfies InteractivitySchema;

const fade = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const scroll = (frame: number, from: number, to: number, a: number, b: number) =>
  interpolate(frame, [from, to], [a, b], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });

const Frame: React.FC<{ readonly style?: React.CSSProperties; readonly children: React.ReactNode }> = ({
  style,
  children,
}) => <AbsoluteFill style={{ background: C.bg, ...style }}>{children}</AbsoluteFill>;

/* ---------- Sign in ---------- */

const EMAIL = "e1234567@u.nus.edu";

const SignInInner: React.FC<SceneProps> = ({ step, title, body, style }) => {
  const frame = useCurrentFrame();
  const typed = EMAIL.slice(0, Math.max(0, Math.floor((frame - 24) / 2)));
  const focused = frame >= 18;

  return (
    <Frame style={style}>
      <Caption step={step} title={title} body={body} />
      <Phone>
        <Shot src="01-login" />
        {/* The capture has an empty field; the address is typed over it. */}
        <div
          style={{
            position: "absolute",
            left: 51,
            top: 1032,
            width: 1068,
            height: 151,
            boxSizing: "border-box",
            borderRadius: 30,
            background: C.surface,
            border: `${focused ? 6 : 3}px solid ${focused ? C.accent : C.divider}`,
            display: "flex",
            alignItems: "center",
            paddingLeft: 33,
            fontFamily,
            fontSize: 45,
            color: typed ? C.text : C.neutral700,
          }}
        >
          {typed || "e1234567@u.nus.edu"}
          {focused && frame < 96 ? (
            <span
              style={{
                width: 4,
                height: 56,
                marginLeft: 2,
                background: C.text,
                opacity: Math.floor(frame / 8) % 2 === 0 || typed.length < EMAIL.length ? 1 : 0,
              }}
            />
          ) : null}
        </div>
        <Tap x={582} y={1380} at={100} />
      </Phone>
    </Frame>
  );
};

export const SignIn = Interactive.withSchema({
  Component: SignInInner,
  componentName: "<SignIn>",
  schema,
  wrapInSequence: true,
});

/* ---------- Location ---------- */

const NearbyInner: React.FC<SceneProps> = ({ step, title, body, style }) => {
  return (
    <Frame style={style}>
      <Caption step={step} title={title} body={body} />
      <Phone>
        <Shot src="03-location" />
        <Tap x={582} y={984} at={84} />
      </Phone>
    </Frame>
  );
};

export const Nearby = Interactive.withSchema({
  Component: NearbyInner,
  componentName: "<Nearby>",
  schema,
  wrapInSequence: true,
});

/* ---------- Browse ---------- */

const BrowseInner: React.FC<SceneProps> = ({ step, title, body, style }) => {
  const frame = useCurrentFrame();
  return (
    <Frame style={style}>
      <Caption step={step} title={title} body={body} />
      <Phone>
        <Shot src="04-browse" />
        {frame < 110 ? <Highlight x={22} y={950} w={1126} h={340} at={40} color={C.ok} /> : null}
        {frame >= 110 ? <Highlight x={296} y={1838} w={668} h={78} at={110} color={C.few} /> : null}
      </Phone>
    </Frame>
  );
};

export const Browse = Interactive.withSchema({
  Component: BrowseInner,
  componentName: "<Browse>",
  schema,
  wrapInSequence: true,
});

/* ---------- Filters ---------- */

const FilterInner: React.FC<SceneProps> = ({ step, title, body, style }) => {
  const frame = useCurrentFrame();
  return (
    <Frame style={style}>
      <Caption step={step} title={title} body={body} />
      <Phone>
        <Shot src="04-browse" />
        <Shot src="05-filtered" opacity={fade(frame, 66, 72)} />
        <Tap x={785} y={570} at={34} />
        <Tap x={133} y={695} at={66} />
        {frame >= 92 ? <Highlight x={28} y={366} w={430} h={104} at={92} /> : null}
      </Phone>
    </Frame>
  );
};

export const Filter = Interactive.withSchema({
  Component: FilterInner,
  componentName: "<Filter>",
  schema,
  wrapInSequence: true,
});

/* ---------- Spot detail ---------- */

const DETAIL_SCROLL = 3936 - 2532;

const DetailInner: React.FC<SceneProps> = ({ step, title, body, style }) => {
  const frame = useCurrentFrame();
  return (
    <Frame style={style}>
      <Caption step={step} title={title} body={body} />
      <Phone>
        <Shot src="05-filtered" />
        <Shot
          src="08-detail-full"
          scrollY={scroll(frame, 110, 165, 0, DETAIL_SCROLL)}
          opacity={fade(frame, 30, 38)}
        />
        <Tap x={538} y={1376} at={24} />
        {frame >= 60 && frame < 110 ? <Highlight x={18} y={880} w={1134} h={900} at={60} color={C.few} /> : null}
      </Phone>
    </Frame>
  );
};

export const Detail = Interactive.withSchema({
  Component: DetailInner,
  componentName: "<Detail>",
  schema,
  wrapInSequence: true,
});

/* ---------- One-tap report ---------- */

const REPORTED_SCROLL = 3972 - 2532;

const ReportInner: React.FC<SceneProps> = ({ step, title, body, style }) => {
  const frame = useCurrentFrame();
  const swapped = fade(frame, 34, 40);
  const count = Math.round(
    interpolate(frame, [118, 146], [23, 81], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }),
  );

  return (
    <Frame style={style}>
      <Caption step={step} title={title} body={body}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 24,
            marginTop: 12,
            fontFamily,
            opacity: fade(frame, 108, 118),
          }}
        >
          <span
            style={{
              fontSize: 132,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: count >= 40 ? C.okText : C.fewText,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {count}
          </span>
          <span style={{ fontSize: 44, color: C.neutral800 }}>seats free · reported just now</span>
        </div>
      </Caption>
      <Phone>
        <Shot src="08-detail-full" scrollY={DETAIL_SCROLL} />
        <Shot
          src="09-reported-full"
          scrollY={scroll(frame, 88, 124, REPORTED_SCROLL, 0)}
          opacity={swapped}
        />
        <Tap x={308} y={1907} at={28} />
        {frame >= 46 && frame < 88 ? <Highlight x={40} y={2240} w={710} h={115} at={46} color={C.ok} /> : null}
        {frame >= 126 ? <Highlight x={30} y={900} w={440} h={460} at={126} color={C.ok} /> : null}
      </Phone>
    </Frame>
  );
};

export const Report = Interactive.withSchema({
  Component: ReportInner,
  componentName: "<Report>",
  schema,
  wrapInSequence: true,
});
