import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useTheme } from '@/contexts/theme-context';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  try {
    const { currentTheme } = useTheme();
    if (hasHydrated) {
      return currentTheme;
    }
    return 'light';
  } catch {
    // Fallback si le contexte n'est pas disponible
    const colorScheme = useRNColorScheme();
    if (hasHydrated) {
      return colorScheme;
    }
    return 'light';
  }
}
