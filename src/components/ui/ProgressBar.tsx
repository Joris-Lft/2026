import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  /** Nombre d'éléments accomplis. */
  value: number;
  /** Total visé. Un total nul masque la barre. */
  max: number;
  /** Libellé lu par les lecteurs d'écran à la place de « x sur y ». */
  ariaLabel?: string;
}

/** Avancement « x / y » et sa frise, pour une liste à cocher. */
export function ProgressBar({ value, max, ariaLabel }: ProgressBarProps) {
  if (max <= 0) return null;

  const percent = Math.min(Math.round((value / max) * 100), 100);
  const isComplete = value >= max;

  return (
    <div className={styles.progress}>
      <p
        className={`${styles.count} ${isComplete ? styles.countComplete : ""}`}
      >
        {value}/{max}
      </p>

      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel ?? `${value} sur ${max}`}
      >
        <div className={styles.bar} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
