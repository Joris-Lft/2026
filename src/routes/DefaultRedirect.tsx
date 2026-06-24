import { Navigate } from "react-router";
import { getDefaultNavRoute } from "@/constants/navigation";
import { useNavigationPreferences } from "@/contexts/navigation-preferences-context";

export function DefaultRedirect() {
  const { preferences, isLoading } = useNavigationPreferences();

  if (isLoading) {
    return null;
  }

  return <Navigate to={getDefaultNavRoute(preferences)} replace />;
}
