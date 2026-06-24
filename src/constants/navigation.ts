import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  NotebookPen,
  Ruler,
  UserCircle,
} from "lucide-react";
import type { NavFeature, NavigationPreferences } from "@/types/navigation-preferences";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  feature?: NavFeature;
};

export const NAV_ITEMS: NavItem[] = [
  { to: "/habits", label: "Habits", icon: BarChart3, feature: "habits" },
  { to: "/measures", label: "Mensurations", icon: Ruler, feature: "measures" },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/profil", label: "Profil", icon: UserCircle },
];

export function isNavItemVisible(
  item: NavItem,
  preferences: NavigationPreferences,
): boolean {
  if (!item.feature) {
    return true;
  }
  return preferences[item.feature];
}

export function getVisibleNavItems(
  preferences: NavigationPreferences,
): NavItem[] {
  return NAV_ITEMS.filter((item) => isNavItemVisible(item, preferences));
}

export function getDefaultNavRoute(
  preferences: NavigationPreferences,
): string {
  return getVisibleNavItems(preferences)[0]?.to ?? "/profil";
}
