import { useAuth } from "@/contexts/auth-context";
import { useHabitsHeatmap } from "@/hooks/use-habits";
import { Skeleton } from "@/components/ui/Skeleton";
import { HEATMAP_WINDOWS, type HeatmapSection } from "@/utils/habit-heatmap";
import type { HabitFrequency } from "@/types/habits";
import styles from "./HabitHeatmap.module.css";

const SECTION_TITLES: Record<HabitFrequency, string> = {
  daily: `Quotidien · ${HEATMAP_WINDOWS.daily} derniers jours`,
  weekly: `Hebdomadaire · ${HEATMAP_WINDOWS.weekly} dernières semaines`,
  monthly: `Mensuel · ${HEATMAP_WINDOWS.monthly} derniers mois`,
};

const CELL_STATE_LABELS = {
  done: "fait",
  missed: "non fait",
  inactive: "habitude pas encore créée",
} as const;

function formatScore(score: number | null) {
  return score === null ? "—" : `${score} %`;
}

/** Barre + pourcentage, à droite de chaque ligne. */
function Score({ value }: { value: number | null }) {
  return (
    <span className={styles.score}>
      <span className={styles.scoreTrack}>
        <span className={styles.scoreBar} style={{ width: `${value ?? 0}%` }} />
      </span>
      <span className={styles.scoreValue}>{formatScore(value)}</span>
    </span>
  );
}

function Section({ section }: { section: HeatmapSection }) {
  const { labels, rows, totals } = section;

  return (
    <div className={styles.section}>
      <p className={styles.sectionTitle}>{SECTION_TITLES[section.frequency]}</p>

      {rows.map((row) => (
        <div
          key={row.habitId}
          className={styles.row}
          role="img"
          aria-label={`${row.name} : ${formatScore(row.score)} de réussite`}
        >
          <span className={styles.name} title={row.name}>
            {row.name}
          </span>
          <span className={styles.cells} aria-hidden>
            {row.cells.map((cell) => (
              <span
                key={cell.periodKey}
                className={`${styles.cell} ${styles[cell.state]}`}
                title={`${cell.label} · ${CELL_STATE_LABELS[cell.state]}`}
              />
            ))}
          </span>
          <Score value={row.score} />
        </div>
      ))}

      {/* Synthèse : l'intensité de chaque case suit la part d'habitudes cochées. */}
      <div
        className={`${styles.row} ${styles.totalRow}`}
        role="img"
        aria-label={`Toutes habitudes confondues : ${formatScore(section.score)} de réussite`}
      >
        <span className={styles.name}>Global</span>
        <span className={styles.cells} aria-hidden>
          {totals.map((ratio, index) => (
            <span
              key={section.periodKeys[index]}
              className={styles.cell}
              style={{ opacity: ratio === null ? 0.12 : 0.25 + ratio * 0.75 }}
              title={`${labels[index]} · ${ratio === null ? "aucune habitude" : `${Math.round(ratio * 100)} %`}`}
            />
          ))}
        </span>
        <Score value={section.score} />
      </div>

      <div className={styles.axis} aria-hidden>
        <span />
        <span className={styles.axisDates}>
          <span>{labels[0]}</span>
          <span>{labels[labels.length - 1]}</span>
        </span>
        <span />
      </div>
    </div>
  );
}

/** Grille d'assiduité : une case par période et par habitude, sur 3 semaines. */
export function HabitHeatmap() {
  const { user } = useAuth();
  // `isLoadingError` et non `isError` : un refetch d'arrière-plan qui échoue ne
  // doit pas remplacer une grille déjà affichée par un message d'erreur.
  const {
    data: sections = [],
    isLoading,
    isLoadingError,
  } = useHabitsHeatmap(user?.email);

  if (!isLoading && !isLoadingError && sections.length === 0) return null;

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Assiduité</h2>
        <p className={styles.subtitle}>Une case par période, par habitude</p>

        {isLoading ? (
          <Skeleton variant="block" height={160} />
        ) : isLoadingError ? (
          <p className={styles.error} role="alert">
            Impossible de charger l&apos;historique.
          </p>
        ) : (
          <>
            <div className={styles.scroll}>
              {sections.map((section) => (
                <Section key={section.frequency} section={section} />
              ))}
            </div>

            <p className={styles.legend}>
              <span className={`${styles.swatch} ${styles.missed}`} />
              <span>non fait</span>
              <span className={`${styles.swatch} ${styles.done}`} />
              <span>fait</span>
              <span className={styles.legendSeparator} />
              <span>ligne « Global » : 0 %</span>
              {[0.12, 0.45, 0.72, 1].map((opacity) => (
                <span
                  key={opacity}
                  className={`${styles.swatch} ${styles.done}`}
                  style={{ opacity }}
                />
              ))}
              <span>100 %</span>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
