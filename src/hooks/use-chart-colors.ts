import { getChartColors } from "@/constants/charts";
import { useTheme } from "@/contexts/theme-context";

export function useChartColors() {
  const { currentTheme } = useTheme();
  return getChartColors(currentTheme);
}
