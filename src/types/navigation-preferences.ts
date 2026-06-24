export type NavFeature = "habits" | "measures";

export type NavigationPreferences = Record<NavFeature, boolean>;

export const DEFAULT_NAVIGATION_PREFERENCES: NavigationPreferences = {
  habits: true,
  measures: true,
};
