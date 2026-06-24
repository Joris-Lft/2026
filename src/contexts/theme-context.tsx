import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ColorScheme } from "@/constants/theme";
import { storage } from "@/utils/storage";

const THEME_STORAGE_KEY = "@app_theme_preference";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  themeMode: ThemeMode;
  currentTheme: ColorScheme;
  toggleTheme: () => void;
  isLoading: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ColorScheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [systemTheme, setSystemTheme] = useState<ColorScheme>(getSystemTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const savedTheme = await storage.getItem(THEME_STORAGE_KEY);
        if (
          savedTheme === "light" ||
          savedTheme === "dark" ||
          savedTheme === "system"
        ) {
          setThemeModeState(savedTheme);
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setSystemTheme(getSystemTheme());
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const currentTheme: ColorScheme =
    themeMode === "system" ? systemTheme : themeMode;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [currentTheme]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    void storage.setItem(THEME_STORAGE_KEY, mode);
  };

  const toggleTheme = () => {
    const newTheme: ThemeMode = currentTheme === "light" ? "dark" : "light";
    setThemeMode(newTheme);
  };

  const value = useMemo(
    () => ({
      themeMode,
      currentTheme,
      toggleTheme,
      isLoading,
      setThemeMode,
    }),
    [themeMode, currentTheme, isLoading],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
