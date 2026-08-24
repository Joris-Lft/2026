import { Navigate, useParams } from "react-router";
import { PROJECT_SCOPES } from "@/constants/project-scope";

/** Ancienne URL de détail `/voyages/:travelId`, conservée pour les liens en favori. */
export function LegacyTravelRedirect() {
  const { travelId } = useParams<{ travelId: string }>();
  return (
    <Navigate to={`${PROJECT_SCOPES.shared.basePath}/${travelId}`} replace />
  );
}
