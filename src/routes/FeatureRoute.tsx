import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { getDefaultNavRoute } from "@/constants/navigation";
import { useNavigationPreferences } from "@/contexts/navigation-preferences-context";
import type { NavFeature } from "@/types/navigation-preferences";

export function FeatureRoute({
  feature,
  children,
}: {
  feature: NavFeature;
  children: ReactNode;
}) {
  const { preferences, isLoading } = useNavigationPreferences();

  if (isLoading) {
    return null;
  }

  if (!preferences[feature]) {
    return <Navigate to={getDefaultNavRoute(preferences)} replace />;
  }

  return children;
}
