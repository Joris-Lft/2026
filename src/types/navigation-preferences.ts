export type NavFeature = "habits" | "measures" | "personalProjects";

export type NavigationPreferences = Record<NavFeature, boolean>;

export const DEFAULT_NAVIGATION_PREFERENCES: NavigationPreferences = {
  habits: true,
  measures: true,
  personalProjects: true,
};
