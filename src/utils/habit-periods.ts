import {
  format,
  getISOWeek,
  getISOWeekYear,
  parseISO,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { fr } from "date-fns/locale";
import type { HabitFrequency } from "@/types/habits";

/**
 * Clé de période d'un log, unique dans le temps et triable alphabétiquement :
 * `2026-08-24`, `2026-W35`, `2026-08`.
 *
 * L'année fait partie de la clé : sans elle, les logs d'une même semaine (ou
 * d'un même mois) se confondaient d'une année sur l'autre.
 *
 * La semaine suit la norme ISO (lundi → dimanche) et emploie l'année ISO, pour
 * que les semaines à cheval sur le 1er janvier tombent bien dans une seule clé.
 */
export function getPeriodKey(frequency: HabitFrequency, date: Date): string {
  switch (frequency) {
    case "daily":
      return format(date, "yyyy-MM-dd");
    case "weekly":
      return `${getISOWeekYear(date)}-W${String(getISOWeek(date)).padStart(2, "0")}`;
    case "monthly":
      return format(date, "yyyy-MM");
  }
}

const SHIFT_BY_FREQUENCY: Record<
  HabitFrequency,
  (date: Date, amount: number) => Date
> = {
  daily: subDays,
  weekly: subWeeks,
  monthly: subMonths,
};

/**
 * Les `count` dernières clés de période, de la plus ancienne à la plus récente,
 * `date` incluse.
 *
 * Les clés étant triables, l'ordre du tableau est aussi l'ordre d'affichage.
 */
export function getRecentPeriodKeys(
  frequency: HabitFrequency,
  date: Date,
  count: number,
): string[] {
  const shift = SHIFT_BY_FREQUENCY[frequency];

  return Array.from({ length: count }, (_, index) =>
    getPeriodKey(frequency, shift(date, count - 1 - index)),
  );
}

/** Libellé court d'une clé de période : `lun. 24/08`, `S35`, `août`. */
export function formatPeriodKey(
  frequency: HabitFrequency,
  periodKey: string,
): string {
  switch (frequency) {
    case "daily":
      return format(parseISO(periodKey), "EEE dd/MM", { locale: fr });
    case "weekly":
      return `S${periodKey.slice(-2)}`;
    case "monthly":
      return format(parseISO(`${periodKey}-01`), "MMM yyyy", { locale: fr });
  }
}
