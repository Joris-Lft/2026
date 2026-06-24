const tintColorLight = "#0a7ea4";
const tintColorDark = "#2dd4bf";

export const Colors = {
  light: {
    text: "#0a0e1a",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#f8fafc",
    background: "#0a0e1a",
    tint: tintColorDark,
    icon: "#2dd4bf",
    tabIconDefault: "#fff",
    tabIconSelected: tintColorDark,
  },
} as const;

export type ColorScheme = keyof typeof Colors;

export const Fonts = {
  sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
};
