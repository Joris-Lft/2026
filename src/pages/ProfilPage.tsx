import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import styles from "./ProfilPage.module.css";

export function ProfilPage() {
  const { user, logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      setError("Impossible de se déconnecter");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>Profil</h1>

        {user && (
          <div className={styles.userInfo}>
            {user.Name && (
              <>
                <span className={styles.label}>Nom:</span>
                <span className={styles.value}>{user.Name as string}</span>
              </>
            )}
            <span className={styles.label}>Email:</span>
            <span className={styles.value}>{user.email}</span>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        {showConfirm ? (
          <div className={styles.confirmBox}>
            <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setShowConfirm(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className={styles.button}
                onClick={() => void handleLogout()}
              >
                Déconnexion
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className={styles.button}
            onClick={() => setShowConfirm(true)}
          >
            Se déconnecter
          </button>
        )}
      </div>
    </div>
  );
}
