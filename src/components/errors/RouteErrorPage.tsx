import { isRouteErrorResponse, useRouteError } from "react-router";
import { HOME_ROUTE } from "@/constants/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ErrorFallback } from "./ErrorFallback";

export function RouteErrorPage() {
  const error = useRouteError();
  const { isAuthenticated } = useAuth();
  const homeTo = isAuthenticated ? HOME_ROUTE : "/login";
  const homeLabel = isAuthenticated
    ? "Retour aux notes"
    : "Retour à la connexion";

  if (isRouteErrorResponse(error)) {
    return (
      <ErrorFallback
        title={error.status === 404 ? "Page introuvable" : `Erreur ${error.status}`}
        message={
          error.statusText ||
          "La page demandée n'existe pas ou une erreur s'est produite."
        }
        homeTo={homeTo}
        homeLabel={homeLabel}
        showHomeLink
      />
    );
  }

  const message =
    error instanceof Error
      ? error.message
      : "Une erreur inattendue s'est produite lors du chargement de la page.";

  return (
    <ErrorFallback
      error={error instanceof Error ? error : null}
      message={message}
      onRetry={() => window.location.reload()}
      homeTo={homeTo}
      homeLabel={homeLabel}
      showHomeLink
    />
  );
}
