import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useNavigationPreferences } from "@/contexts/navigation-preferences-context";
import styles from "./ProfilPage.module.css";

const NAV_SETTINGS = [
  {
    feature: "habits" as const,
    label: "Habits",
    description: "Afficher l'onglet de suivi des habitudes",
  },
  {
    feature: "measures" as const,
    label: "Mensurations",
    description: "Afficher l'onglet de suivi des mensurations",
  },
];

export function ProfilPage() {
  const { user, logout } = useAuth();
  const { preferences, isLoading, saveError, setFeatureEnabled } = useNavigationPreferences();
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

        <section className={styles.settingsSection} aria-labelledby="nav-settings-title">
          <h2 id="nav-settings-title" className={styles.settingsTitle}>
            Navigation
          </h2>
          <p className={styles.settingsHint}>
            Choisissez les onglets visibles dans la barre de navigation.
          </p>
          <ul className={styles.settingsList}>
            {NAV_SETTINGS.map(({ feature, label, description }) => (
              <li key={feature} className={styles.settingItem}>
                <div className={styles.settingText}>
                  <span className={styles.settingLabel}>{label}</span>
                  <span className={styles.settingDescription}>{description}</span>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    className={styles.switchInput}
                    checked={preferences[feature]}
                    disabled={isLoading}
                    onChange={(event) =>
                      setFeatureEnabled(feature, event.target.checked)
                    }
                  />
                  <span className={styles.switchTrack} aria-hidden="true" />
                </label>
              </li>
            ))}
          </ul>
          {saveError && <p className={styles.error}>{saveError}</p>}
        </section>

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
