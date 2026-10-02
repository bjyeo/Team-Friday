import { loadFont } from "@remotion/google-fonts/Archivo";

// The app's own typeface and palette (src/styles/tokens.css in the app), so the
// video reads as the same product as the screenshots inside it.
export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const C = {
  bg: "#f3f2f2",
  surface: "#eae9e9",
  text: "#201e1d",
  divider: "rgba(32, 30, 29, 0.4)",
  neutral700: "#605d5d",
  neutral800: "#444141",
  accent: "oklch(0.52 0.16 255)",
  accent700: "oklch(0.4 0.15 255)",
  ok: "#009e73",
  okText: "#00664a",
  few: "#e69f00",
  fewText: "#7f5300",
  full: "#d55e00",
};

// Screenshots were captured at 390x844 CSS px with a device scale factor of 3.
export const SHOT_W = 1170;
export const SHOT_H = 2532;
