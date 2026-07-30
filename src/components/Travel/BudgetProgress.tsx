import {
  SPEND_LEVELS,
  type SpendLevel,
  type TravelBudgetTotals,
} from "@/types/travel-budget";
import styles from "./BudgetProgress.module.css";

const currency = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const levelClassNames: Record<SpendLevel, string> = {
  "Strict minimum": styles.checkpointMin,
  Confortable: styles.checkpointComfort,
  Royal: styles.checkpointRoyal,
};

/** Libellés courts : sur la liste, les cartes sont sur 2 colonnes en mobile. */
const levelShortLabels: Record<SpendLevel, string> = {
  "Strict minimum": "Min",
  Confortable: "Confort",
  Royal: "Royal",
};

/** Un palier par niveau de dépense, en montant cumulé (min, puis + confort, puis + royal). */
function buildCheckpoints(totals: TravelBudgetTotals, saved: number) {
  if (totals.total <= 0) return [];

  let cumulative = 0;
  return SPEND_LEVELS.flatMap((level) => {
    const amount = totals.byLevel[level];
    if (amount <= 0) return [];
    cumulative += amount;
    return [
      {
        level,
        amount: cumulative,
        position: (cumulative / totals.total) * 100,
        reached: saved >= cumulative,
      },
    ];
  });
}

interface BudgetProgressProps {
  /** Budget prévisionnel du voyage, détaillé par niveau de dépense. */
  totals: TravelBudgetTotals;
  /** Montant déjà disponible dans la cagnotte. */
  saved: number;
}

/**
 * Frise d'avancement de la cagnotte sur le budget prévisionnel, annotée des
 * paliers cumulés (strict minimum, confortable, royal).
 */
export function BudgetProgress({ totals, saved }: BudgetProgressProps) {
  if (totals.total <= 0) return null;

  const progress = Math.min((saved / totals.total) * 100, 100);
  const isFunded = saved >= totals.total;
  const checkpoints = buildCheckpoints(totals, saved);

  return (
    <div className={styles.budget}>
      <div className={styles.annotations} aria-hidden>
        {checkpoints.map((checkpoint) => (
          <span
            key={checkpoint.level}
            className={`${styles.annotation} ${levelClassNames[checkpoint.level]} ${
              checkpoint.reached ? styles.checkpointReached : ""
            }`}
            style={{ right: `${100 - checkpoint.position}%` }}
          >
            {levelShortLabels[checkpoint.level]}
          </span>
        ))}
      </div>

      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Budget financé à ${Math.round(progress)} %${checkpoints
          .map((c) => `, ${c.level} à ${currency.format(c.amount)}`)
          .join("")}`}
      >
        <div
          className={`${styles.progressBar} ${isFunded ? styles.progressFunded : ""}`}
          style={{ width: `${progress}%` }}
        />
        {/* Le dernier palier tombe sur la fin de la frise, déjà marquée. */}
        {checkpoints
          .filter((checkpoint) => checkpoint.position < 99.5)
          .map((checkpoint) => (
            <span
              key={checkpoint.level}
              aria-hidden
              className={`${styles.checkpoint} ${levelClassNames[checkpoint.level]} ${
                checkpoint.reached ? styles.checkpointReached : ""
              }`}
              style={{ left: `${checkpoint.position}%` }}
            />
          ))}
      </div>

      <p className={styles.budgetAmounts}>
        <span className={styles.saved}>{currency.format(saved)}</span>
        <span className={styles.estimated}>
          / {currency.format(totals.total)}
        </span>
      </p>
    </div>
  );
}
