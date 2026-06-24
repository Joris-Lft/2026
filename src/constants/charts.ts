import type { ColorScheme } from "@/constants/theme";
import type { MeasureKey } from "@/types/measures";

export type ChartMetricKey = Exclude<MeasureKey, "weight"> | "weight";

export type ChartColors = {
  metrics: Record<ChartMetricKey, string>;
  axis: string;
  grid: string;
  tooltipBackground: string;
  tooltipBorder: string;
  tooltipText: string;
};

const CHART_PALETTES: Record<ColorScheme, ChartColors> = {
  light: {
    metrics: {
      thigh: "#c45d3e",
      arm: "#4a6fa5",
      bust: "#5a8f6f",
      waist: "#c9973b",
      hip: "#8b6aad",
      weight: "#2a9d8f",
    },
    axis: "#78716c",
    grid: "rgba(28, 25, 23, 0.08)",
    tooltipBackground: "#ffffff",
    tooltipBorder: "rgba(28, 25, 23, 0.12)",
    tooltipText: "#1c1917",
  },
  dark: {
    metrics: {
      thigh: "#e8a87c",
      arm: "#7eb0d8",
      bust: "#8fd4a8",
      waist: "#e8c468",
      hip: "#c4a8e8",
      weight: "#5fd4c0",
    },
    axis: "#a8a29e",
    grid: "rgba(250, 248, 245, 0.08)",
    tooltipBackground: "#252220",
    tooltipBorder: "rgba(250, 248, 245, 0.12)",
    tooltipText: "#faf8f5",
  },
};

export const CM_METRICS: { key: Exclude<MeasureKey, "weight">; label: string }[] = [
  { key: "thigh", label: "Cuisse" },
  { key: "arm", label: "Bras" },
  { key: "bust", label: "Poitrine" },
  { key: "waist", label: "Taille" },
  { key: "hip", label: "Hanche" },
];

export function getChartColors(theme: ColorScheme): ChartColors {
  return CHART_PALETTES[theme];
}
