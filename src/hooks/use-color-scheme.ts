import { useTheme } from "@/contexts/theme-context";

export function useColorScheme() {
  const { currentTheme } = useTheme();
  return currentTheme;
}
