import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  fetchNavigationPreferences,
  getAirtableErrorMessage,
  updateNavigationPreferences,
} from "@/services/user-preferences";
import type {
  NavFeature,
  NavigationPreferences,
} from "@/types/navigation-preferences";
import { DEFAULT_NAVIGATION_PREFERENCES } from "@/types/navigation-preferences";

interface NavigationPreferencesContextType {
  preferences: NavigationPreferences;
  isLoading: boolean;
  saveError: string | null;
  setFeatureEnabled: (feature: NavFeature, enabled: boolean) => void;
}

const NavigationPreferencesContext = createContext<
  NavigationPreferencesContextType | undefined
>(undefined);

export function NavigationPreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NavigationPreferences>(
    DEFAULT_NAVIGATION_PREFERENCES,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setPreferences(DEFAULT_NAVIGATION_PREFERENCES);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void (async () => {
      try {
        const saved = await fetchNavigationPreferences(user.id);
        if (!cancelled) {
          setPreferences(saved);
        }
      } catch (error) {
        console.error("Fetch navigation preferences error:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const setFeatureEnabled = useCallback(
    (feature: NavFeature, enabled: boolean) => {
      if (!user?.id) {
        return;
      }

      setSaveError(null);

      setPreferences((current) => {
        const previous = current;
        const next = { ...current, [feature]: enabled };

        void updateNavigationPreferences(user.id, next).catch((error) => {
          console.error("Update navigation preferences error:", error);
          setPreferences(previous);
          setSaveError(getAirtableErrorMessage(error));
        });

        return next;
      });
    },
    [user?.id],
  );

  const value = useMemo(
    () => ({
      preferences,
      isLoading,
      saveError,
      setFeatureEnabled,
    }),
    [preferences, isLoading, saveError, setFeatureEnabled],
  );

  return (
    <NavigationPreferencesContext.Provider value={value}>
      {children}
    </NavigationPreferencesContext.Provider>
  );
}

export function useNavigationPreferences() {
  const context = useContext(NavigationPreferencesContext);
  if (context === undefined) {
    throw new Error(
      "useNavigationPreferences must be used within a NavigationPreferencesProvider",
    );
  }
  return context;
}
