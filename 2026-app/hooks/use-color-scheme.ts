import { useColorScheme as useRNColorScheme } from 'react-native';
import { useTheme } from '@/contexts/theme-context';

export function useColorScheme() {
  try {
    const { currentTheme } = useTheme();
    return currentTheme;
  } catch {
    // Fallback si le contexte n'est pas disponible
    return useRNColorScheme();
  }
}
