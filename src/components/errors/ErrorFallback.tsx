import { Link } from "react-router";
import styles from "./ErrorPage.module.css";

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  error?: Error | null;
  onRetry?: () => void;
  showHomeLink?: boolean;
  homeTo?: string;
  homeLabel?: string;
}

export function ErrorFallback({
  title = "Une erreur est survenue",
  message = "Quelque chose s'est mal passé. Vous pouvez réessayer ou revenir à l'accueil.",
  error,
  onRetry,
  showHomeLink = true,
  homeTo = "/login",
  homeLabel = "Retour à l'accueil",
}: ErrorFallbackProps) {
  return (
    <div className={styles.page} role="alert">
      <div className={styles.card}>
        <p className={styles.code}>Erreur</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{message}</p>

        {import.meta.env.DEV && error?.message && (
          <pre className={styles.details}>{error.message}</pre>
        )}

        <div className={styles.actions}>
          {onRetry && (
            <button type="button" className={styles.button} onClick={onRetry}>
              Réessayer
            </button>
          )}
          {showHomeLink && (
            <Link
              to={homeTo}
              className={onRetry ? styles.linkButton : styles.button}
            >
              {homeLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
