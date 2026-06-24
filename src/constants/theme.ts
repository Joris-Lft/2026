const tintColorLight = "#c45d3e";
const tintColorDark = "#e8a87c";

export const Colors = {
  light: {
    text: "#1c1917",
    background: "#f3ede6",
    tint: tintColorLight,
    icon: "#78716c",
    tabIconDefault: "#a8a29e",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#faf8f5",
    background: "#12100e",
    tint: tintColorDark,
    icon: "#d6d3d1",
    tabIconDefault: "#a8a29e",
    tabIconSelected: tintColorDark,
  },
} as const;

export type ColorScheme = keyof typeof Colors;

export const Fonts = {
  sans: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
};
