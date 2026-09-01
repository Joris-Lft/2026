import { useEffect, useRef } from "react";
import { format, parseISO } from "date-fns";
import { ARC_END, ARC_START } from "@/constants/arc";
import { useAuth } from "@/contexts/auth-context";
import { useArcTable } from "@/hooks/use-habits";
import { Skeleton } from "@/components/ui/Skeleton";
import type {
  ArcCell,
  ArcCellState,
  ArcSection,
  ArcTableModel,
} from "@/utils/arc-table";
import type { HabitFrequency } from "@/types/habits";
import styles from "./ArcTable.module.css";

const SECTION_TITLES: Record<HabitFrequency, string> = {
  daily: "Quotidien",
  weekly: "Hebdomadaire",
  monthly: "Mensuel",
};

const CELL_STATE_LABELS: Record<ArcCellState, string> = {
  done: "fait",
  missed: "non fait",
  future: "à venir",
  inactive: "habitude pas encore créée",
};

/** Largeur d'une case, en jours d'arc : la géométrie vit dans le CSS. */
function spanWidth(span: number): string {
  return `calc(var(--day-w) * ${span} + var(--gap) * ${span - 1})`;
}

function formatBound(day: string): string {
  return format(parseISO(day), "dd/MM");
}

function formatScore(score: number | null): string {
  return score === null ? "—" : `${score} %`;
}

function Cell({ cell }: { cell: ArcCell }) {
  return (
    <span
      className={`${styles.cell} ${styles[cell.state]}`}
      style={{ width: spanWidth(cell.span) }}
      title={`${cell.label} · ${CELL_STATE_LABELS[cell.state]}`}
    />
  );
}

function Section({ section }: { section: ArcSection }) {
  return (
    <div className={styles.section}>
      <p className={styles.sectionTitle}>{SECTION_TITLES[section.frequency]}</p>

      {section.rows.map((row) => (
        <div
          key={row.habitId}
          className={styles.row}
          role="img"
          aria-label={
            row.score === null
              ? `${row.name} : aucune période close`
              : `${row.name} : ${row.score} % de réussite sur l'arc`
          }
        >
          <span className={styles.name} title={row.name}>
            {row.name}
          </span>
          <span className={styles.score}>{formatScore(row.score)}</span>
          <span className={styles.cells} aria-hidden>
            {row.cells.map((cell) => (
              <Cell key={cell.periodKey} cell={cell} />
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Amène la colonne du jour dans le champ de vision au premier affichage : sur
 * mobile, une trentaine de jours seulement tiennent à l'écran, et l'arc s'ouvre
 * sinon sur son premier jour.
 */
function useScrollToToday(todayIndex: number) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || hasScrolled.current || todayIndex < 0) return;

    hasScrolled.current = true;

    // Les largeurs vivent dans le CSS : on les relit plutôt que de les
    // dupliquer ici, où elles se désaligneraient au premier ajustement.
    const computed = getComputedStyle(element.firstElementChild ?? element);
    const px = (name: string) => parseFloat(computed.getPropertyValue(name)) || 0;

    const offset =
      px("--name-w") +
      px("--score-w") +
      (px("--day-w") + px("--gap")) * todayIndex;

    // Le jour se cale aux deux tiers de la fenêtre : la suite de l'arc reste
    // visible, et l'historique récent aussi.
    element.scrollLeft = offset - element.clientWidth * 0.66;
  }, [todayIndex]);

  return scrollRef;
}

function Grid({ table }: { table: ArcTableModel }) {
  const scrollRef = useScrollToToday(table.todayIndex);

  return (
    <div className={styles.scroll} ref={scrollRef}>
      <div className={styles.grid}>
        {/* Un trait continu plutôt qu'une case surlignée par ligne : sur une
            vingtaine de lignes, il se suit bien mieux. */}
        {table.todayIndex >= 0 && (
          <span
            className={styles.todayLine}
            style={{
              left: `calc(var(--name-w) + var(--score-w) + (var(--day-w) + var(--gap)) * ${table.todayIndex})`,
            }}
          />
        )}

        <div className={styles.monthRow} aria-hidden>
          <span className={styles.monthSpacer} />
          {table.months.map((month) => (
            <span
              key={month.key}
              className={styles.month}
              // `+ var(--gap)` : la case suivante commence après la gouttière.
              style={{ width: `calc(${spanWidth(month.span)} + var(--gap))` }}
            >
              <span className={styles.monthLabel}>{month.label}</span>
            </span>
          ))}
        </div>

        {table.sections.map((section) => (
          <Section key={section.frequency} section={section} />
        ))}
      </div>
    </div>
  );
}

/** Le winter arc en tableau : une colonne par jour, une ligne par habitude. */
export function ArcTable() {
  const { user } = useAuth();
  const { table, isLoading, isLoadingError } = useArcTable(user?.email);

  if (!isLoading && !isLoadingError && table?.sections.length === 0) return null;

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <div className={styles.head}>
          <h2 className={styles.title}>Winter arc</h2>
          <p className={styles.subtitle}>
            {formatBound(ARC_START)} → {formatBound(ARC_END)} · une colonne par jour
          </p>
        </div>

        {isLoading ? (
          <div className={styles.head}>
            <Skeleton variant="block" height={220} />
          </div>
        ) : isLoadingError || !table ? (
          <p className={styles.error} role="alert">
            Impossible de charger l&apos;historique de l&apos;arc.
          </p>
        ) : (
          <>
            <Grid table={table} />

            <p className={styles.legend}>
              <span className={styles.swatch} />
              <span>non fait</span>
              <span className={`${styles.swatch} ${styles.done}`} />
              <span>fait</span>
              <span className={`${styles.swatch} ${styles.future}`} />
              <span>à venir</span>
              <span className={`${styles.swatch} ${styles.inactive}`} />
              <span>pas encore créée</span>
              <span>· le trait marque aujourd&apos;hui</span>
              <span>· le % ignore la période en cours</span>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
