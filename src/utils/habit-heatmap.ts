import { parseISO } from "date-fns";
import type { Habit, HabitFrequency } from "@/types/habits";
import { formatPeriodKey, getPeriodKey } from "./habit-periods";

/**
 * Profondeur d'historique par fréquence. Trois semaines suffisent à faire
 * ressortir une habitude qui décroche, sans que la grille déborde de l'écran.
 */
export const HEATMAP_WINDOWS: Record<HabitFrequency, number> = {
  daily: 21,
  weekly: 8,
  monthly: 6,
};

/**
 * `inactive` : la période précède la création de l'habitude. Ces cases sont
 * neutres et sortent du calcul, sinon une habitude créée hier afficherait 5 %.
 */
export type HeatmapCellState = "done" | "missed" | "inactive";

export interface HeatmapCell {
  periodKey: string;
  label: string;
  state: HeatmapCellState;
}

export interface HeatmapRow {
  habitId: string;
  name: string;
  cells: HeatmapCell[];
  /** Taux de réussite en %, `null` si l'habitude n'existait sur aucune période. */
  score: number | null;
}

export interface HeatmapSection {
  frequency: HabitFrequency;
  periodKeys: string[];
  labels: string[];
  rows: HeatmapRow[];
  /** Part d'habitudes cochées par période, `null` si aucune n'existait encore. */
  totals: (number | null)[];
  score: number | null;
}

/** Identifiant d'une complétion : une habitude, une période. */
export function completionKey(habitId: string, periodKey: string): string {
  return `${habitId}|${periodKey}`;
}

function toPercent(done: number, applicable: number): number | null {
  return applicable === 0 ? null : Math.round((done / applicable) * 100);
}

/**
 * Grille d'assiduité d'une fréquence : une ligne par habitude, une colonne par
 * période.
 *
 * @param habits - Toutes les habitudes actives, toutes fréquences confondues
 * @param completions - Clés `habitId|periodKey` des cases cochées
 * @param periodKeys - Colonnes, de la plus ancienne à la plus récente
 */
export function buildHeatmapSection(
  frequency: HabitFrequency,
  habits: Habit[],
  completions: ReadonlySet<string>,
  periodKeys: string[],
): HeatmapSection {
  const labels = periodKeys.map((key) => formatPeriodKey(frequency, key));

  const rows: HeatmapRow[] = habits
    .filter((habit) => habit.frequency === frequency)
    .map((habit) => {
      // Les clés sont triables : comparer celle de la création suffit à savoir
      // si la période est antérieure à l'habitude.
      const creationKey = habit.created_at
        ? getPeriodKey(frequency, parseISO(habit.created_at))
        : undefined;

      let done = 0;
      let applicable = 0;

      const cells = periodKeys.map((periodKey, index) => {
        if (creationKey && periodKey < creationKey) {
          return { periodKey, label: labels[index], state: "inactive" as const };
        }

        applicable += 1;
        const isDone = completions.has(completionKey(habit.id, periodKey));
        if (isDone) done += 1;

        return {
          periodKey,
          label: labels[index],
          state: (isDone ? "done" : "missed") as HeatmapCellState,
        };
      });

      return {
        habitId: habit.id,
        name: habit.name,
        cells,
        score: toPercent(done, applicable),
      };
    });

  const totals = periodKeys.map((_, index) => {
    const cells = rows
      .map((row) => row.cells[index])
      .filter((cell) => cell.state !== "inactive");

    return cells.length === 0
      ? null
      : cells.filter((cell) => cell.state === "done").length / cells.length;
  });

  const applicableCells = rows.flatMap((row) =>
    row.cells.filter((cell) => cell.state !== "inactive"),
  );

  return {
    frequency,
    periodKeys,
    labels,
    rows,
    totals,
    score: toPercent(
      applicableCells.filter((cell) => cell.state === "done").length,
      applicableCells.length,
    ),
  };
}
