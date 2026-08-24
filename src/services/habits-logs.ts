import { format, getISOWeek, getISOWeekYear } from "date-fns";
import {
  AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD,
  AIRTABLE_HABITS_LOGS_USER_ID_FIELD,
  AIRTABLE_HABITS_LOGS_COMPLETED_AT_FIELD,
  AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD,
  AIRTABLE_HABITS_LOGS_PERIOD_FIELD,
} from "./airtable-config";
import { formulaValue } from "./airtable-formula";
import { firstLinkedId } from "./airtable-record";
import type {
  HabitLog,
  HabitFrequency,
  CreateHabitLogInput,
} from "@/types/habits";
import { habitsLogsTable } from "./airtable-client";

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

function toHabitLog(record: {
  id: string;
  fields: Record<string, unknown>;
}): HabitLog {
  const habitId = firstLinkedId(
    record.fields[AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD],
  );
  if (!habitId) {
    // Sans ce lien, le log ne se rattache à aucun habit : la case restera
    // décochée et le clic suivant créera un doublon.
    console.warn(`Log ${record.id} sans habit lié`);
  }

  return {
    ...record.fields,
    id: record.id,
    habit_id: habitId ?? "",
    user_id:
      firstLinkedId(record.fields[AIRTABLE_HABITS_LOGS_USER_ID_FIELD]) ?? "",
    completed_at: record.fields[
      AIRTABLE_HABITS_LOGS_COMPLETED_AT_FIELD
    ] as string,
    frequency: record.fields[
      AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD
    ] as HabitFrequency,
    period: record.fields[AIRTABLE_HABITS_LOGS_PERIOD_FIELD] as string,
  };
}

/**
 * Récupère en une seule requête les logs d'un utilisateur pour plusieurs
 * périodes (typiquement le jour, la semaine et le mois en cours).
 *
 * Laisse remonter l'erreur : des logs manquants afficheraient des cases
 * décochées, et le clic suivant créerait un doublon.
 * @param userId - L'email de l'utilisateur (valeur affichée du champ lié)
 * @param periodKeys - Les clés de période retournées par `getPeriodKey`
 */
export async function getHabitLogsForPeriods(
  userId: string,
  periodKeys: string[],
): Promise<HabitLog[]> {
  if (periodKeys.length === 0) return [];

  const periodFilter = periodKeys
    .map((key) => `{${AIRTABLE_HABITS_LOGS_PERIOD_FIELD}} = ${formulaValue(key)}`)
    .join(", ");

  try {
    const records = await habitsLogsTable
      .select({
        filterByFormula: `AND({${AIRTABLE_HABITS_LOGS_USER_ID_FIELD}} = ${formulaValue(userId)}, OR(${periodFilter}))`,
      })
      .all();

    return records.map(toHabitLog);
  } catch (error) {
    // On trace puis on relaie : l'appelant doit voir l'échec, pas une liste vide.
    console.error("Get habit logs for periods error:", error);
    throw error;
  }
}

/**
 * Crée un nouveau log d'habit dans Airtable
 * @param logData - Les données du log à créer
 * @returns Le log créé ou null en cas d'erreur
 */
export async function createHabitLog(
  logData: CreateHabitLogInput,
): Promise<{ log: HabitLog | null; error?: string }> {
  try {
    const fields: Record<string, any> = {
      [AIRTABLE_HABITS_LOGS_COMPLETED_AT_FIELD]:
        logData.completed_at || new Date().toISOString(),
      [AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD]: logData.frequency,
      [AIRTABLE_HABITS_LOGS_PERIOD_FIELD]: logData.period,
      // Champs liés : Airtable attend un tableau d'identifiants d'enregistrement.
      [AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD]: [logData.habit_id],
      [AIRTABLE_HABITS_LOGS_USER_ID_FIELD]: [logData.user_id],
    };

    const [record] = await habitsLogsTable.create([{ fields }]);

    return { log: toHabitLog(record) };
  } catch (error: any) {
    console.error("Create habit log error:", error);
    return {
      log: null,
      error: error?.message || "Erreur lors de la création du log",
    };
  }
}

/**
 * Supprime un log d'habit
 * @param logId - L'ID du log à supprimer
 * @returns true si la suppression a réussi, false sinon
 */
export async function deleteHabitLog(
  logId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await habitsLogsTable.destroy([logId]);
    return { success: true };
  } catch (error: any) {
    console.error("Delete habit log error:", error);
    return {
      success: false,
      error: error?.message || "Erreur lors de la suppression du log",
    };
  }
}
