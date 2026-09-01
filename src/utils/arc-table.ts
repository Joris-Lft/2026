import { eachDayOfInterval, format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { Habit, HabitFrequency } from "@/types/habits";
import { formatPeriodKey, getPeriodKey } from "./habit-periods";

const FREQUENCIES: HabitFrequency[] = ["daily", "weekly", "monthly"];

/**
 * `future` : la période n'a pas commencé. `inactive` : elle précède la création
 * de l'habitude. Ni l'une ni l'autre n'entre dans le score, sinon une habitude
 * ajoutée en cours d'arc afficherait quelques pourcents.
 */
export type ArcCellState = "done" | "missed" | "future" | "inactive";

export interface ArcCell {
  periodKey: string;
  /** Libellé court de la période, pour l'infobulle. */
  label: string;
  state: ArcCellState;
  /** Jours de l'arc couverts : une case hebdo en vaut 7, une mensuelle ~30. */
  span: number;
}

export interface ArcRow {
  habitId: string;
  name: string;
  cells: ArcCell[];
  /** Taux de réussite en %, `null` tant qu'aucune période n'est close. */
  score: number | null;
}

export interface ArcSection {
  frequency: HabitFrequency;
  rows: ArcRow[];
}

export interface ArcMonth {
  key: string;
  label: string;
  /** Jours du mois compris dans l'arc : l'arc peut commencer en cours de mois. */
  span: number;
}

export interface ArcTableModel {
  days: string[];
  months: ArcMonth[];
  /** Position d'aujourd'hui dans `days`, `-1` si l'arc n'a pas commencé ou est fini. */
  todayIndex: number;
  sections: ArcSection[];
}

/** Les jours de l'arc, du premier au dernier, au format `yyyy-MM-dd`. */
export function getArcDays(start: string, end: string): string[] {
  if (end < start) return [];

  return eachDayOfInterval({
    start: parseISO(start),
    end: parseISO(end),
  }).map((date) => format(date, "yyyy-MM-dd"));
}

/**
 * Les clés de période couvertes par l'arc, par fréquence : c'est la liste que
 * la requête de logs interroge.
 */
export function getArcPeriodKeys(
  start: string,
  end: string,
): Record<HabitFrequency, string[]> {
  const days = getArcDays(start, end);

  const keysOf = (frequency: HabitFrequency) => [
    ...new Set(days.map((day) => getPeriodKey(frequency, parseISO(day)))),
  ];

  return {
    daily: keysOf("daily"),
    weekly: keysOf("weekly"),
    monthly: keysOf("monthly"),
  };
}

/** Nombre de jours de l'arc rattachés à chaque clé, dans l'ordre des clés. */
function spansByKey(days: string[], frequency: HabitFrequency): Map<string, number> {
  const spans = new Map<string, number>();

  days.forEach((day) => {
    const key = getPeriodKey(frequency, parseISO(day));
    spans.set(key, (spans.get(key) ?? 0) + 1);
  });

  return spans;
}

function toPercent(done: number, applicable: number): number | null {
  return applicable === 0 ? null : Math.round((done / applicable) * 100);
}

function buildSection(
  frequency: HabitFrequency,
  habits: Habit[],
  completions: ReadonlySet<string>,
  days: string[],
  today: string,
): ArcSection {
  const spans = spansByKey(days, frequency);
  // Les clés d'une même fréquence sont triables : comparer à celle du jour
  // suffit à savoir si une période est close, en cours ou à venir.
  const currentKey = getPeriodKey(frequency, parseISO(today));

  const rows = habits
    .filter((habit) => habit.frequency === frequency)
    .map((habit) => {
      const creationKey = habit.created_at
        ? getPeriodKey(frequency, parseISO(habit.created_at))
        : undefined;

      let done = 0;
      let applicable = 0;

      const cells = [...spans.entries()].map(([periodKey, span]): ArcCell => {
        const label = formatPeriodKey(frequency, periodKey);

        if (creationKey && periodKey < creationKey) {
          return { periodKey, label, span, state: "inactive" };
        }
        if (periodKey > currentKey) {
          return { periodKey, label, span, state: "future" };
        }

        const isDone = completions.has(completionKey(habit.id, periodKey));

        // La période en cours est affichée mais pas comptée : un mois à peine
        // entamé ferait chuter le score sans rien dire de l'assiduité.
        if (periodKey < currentKey) {
          applicable += 1;
          if (isDone) done += 1;
        }

        return { periodKey, label, span, state: isDone ? "done" : "missed" };
      });

      return {
        habitId: habit.id,
        name: habit.name,
        cells,
        score: toPercent(done, applicable),
      };
    });

  return { frequency, rows };
}

function buildMonths(days: string[]): ArcMonth[] {
  const spans = new Map<string, number>();
  days.forEach((day) => {
    const key = day.slice(0, 7);
    spans.set(key, (spans.get(key) ?? 0) + 1);
  });

  return [...spans.entries()].map(([key, span]) => ({
    key,
    span,
    label: format(parseISO(`${key}-01`), "MMMM", { locale: fr }),
  }));
}

/** Identifiant d'une complétion : une habitude, une période. */
export function completionKey(habitId: string, periodKey: string): string {
  return `${habitId}|${periodKey}`;
}

/**
 * Le tableau de l'arc : une colonne par jour, une ligne par habitude, une
 * section par fréquence.
 *
 * Les lignes hebdomadaires et mensuelles réutilisent le même axe de temps :
 * leurs cases occupent la largeur des jours qu'elles couvrent.
 *
 * @param habits - Toutes les habitudes actives, toutes fréquences confondues
 * @param completions - Clés `habitId|periodKey` des cases cochées
 * @param today - Jour courant `yyyy-MM-dd`, hors de l'arc si celui-ci est fini
 */
export function buildArcTable(
  habits: Habit[],
  completions: ReadonlySet<string>,
  today: string,
  start: string,
  end: string,
): ArcTableModel {
  const days = getArcDays(start, end);

  return {
    days,
    months: buildMonths(days),
    todayIndex: days.indexOf(today),
    sections: FREQUENCIES.map((frequency) =>
      buildSection(frequency, habits, completions, days, today),
    ).filter((section) => section.rows.length > 0),
  };
}
