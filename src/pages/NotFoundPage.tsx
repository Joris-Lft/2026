import { Link } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import styles from "@/components/errors/ErrorPage.module.css";

export function NotFoundPage() {
  const { isAuthenticated } = useAuth();
  const homeTo = isAuthenticated ? "/habits" : "/login";
  const homeLabel = isAuthenticated ? "Retour aux habits" : "Retour à la connexion";

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Page introuvable</h1>
        <p className={styles.subtitle}>
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <div className={styles.actions}>
          <Link to={homeTo} className={styles.button}>
            {homeLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
