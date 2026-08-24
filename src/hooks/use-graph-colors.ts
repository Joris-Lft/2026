import { getGraphColors } from "@/constants/charts";
import { useTheme } from "@/contexts/theme-context";

export function useGraphColors() {
  const { currentTheme } = useTheme();
  return getGraphColors(currentTheme);
}
