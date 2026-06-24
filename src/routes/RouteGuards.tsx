import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import styles from "./RouteGuards.module.css";

function LoadingScreen() {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner} aria-label="Chargement" />
    </div>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/habits" replace />;

  return <Outlet />;
}
