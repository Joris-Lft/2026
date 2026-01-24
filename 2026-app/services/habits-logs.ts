import {
  AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD,
  AIRTABLE_HABITS_LOGS_USER_ID_FIELD,
  AIRTABLE_HABITS_LOGS_COMPLETED_AT_FIELD,
  AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD,
  AIRTABLE_HABITS_LOGS_PERIOD_FIELD,
} from "./airtable-config";
import { HabitLog, HabitFrequency, CreateHabitLogInput } from "@/types/habits";
import { habitsLogsTable } from "./airtable-client";

/**
 * Formate une date au format DD/MM/YYYY pour les daily habits
 */
export function formatDailyPeriod(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Calcule le numéro de semaine de l'année (1-53)
 */
export function getWeekNumber(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return String(weekNumber).padStart(2, "0");
}

/**
 * Formate le numéro de mois (01-12) pour les monthly habits
 */
export function formatMonthlyPeriod(date: Date): string {
  return String(date.getMonth() + 1).padStart(2, "0");
}

/**
 * Récupère les logs d'habits pour un utilisateur, une fréquence et une période donnés
 * @param userId - L'ID de l'utilisateur connecté
 * @param frequency - La fréquence (daily, weekly, monthly)
 * @param period - La période (format dépend de la fréquence)
 * @returns Liste des logs correspondants
 */
export async function getHabitLogsByPeriod(
  userId: string,
  frequency: HabitFrequency,
  period: string
): Promise<HabitLog[]> {
  try {
    const records = await habitsLogsTable
      .select({
        filterByFormula: `AND({${AIRTABLE_HABITS_LOGS_USER_ID_FIELD}} = "${userId}", {${AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD}} = "${frequency}", {${AIRTABLE_HABITS_LOGS_PERIOD_FIELD}} = "${period}")`,
      })
      .all();

    return records.map((record) => {
      const habitIdField = record.fields[AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD];
      const userIdField = record.fields[AIRTABLE_HABITS_LOGS_USER_ID_FIELD];

      // Extraire les champs bruts et exclure ceux qu'on va redéfinir
      const { 
        [AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD]: _habitIdField,
        [AIRTABLE_HABITS_LOGS_USER_ID_FIELD]: _userIdField,
        ...otherFields 
      } = record.fields;

      return {
        id: record.id,
        habit_id: Array.isArray(habitIdField)
          ? (habitIdField as string[])[0]
          : (habitIdField as string),
        user_id: Array.isArray(userIdField)
          ? (userIdField as string[])[0]
          : (userIdField as string),
        completed_at: record.fields[AIRTABLE_HABITS_LOGS_COMPLETED_AT_FIELD] as string,
        frequency: record.fields[AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD] as HabitFrequency,
        period: record.fields[AIRTABLE_HABITS_LOGS_PERIOD_FIELD] as string,
        ...otherFields,
      };
    });
  } catch (error) {
    console.error("Get habit logs by period error:", error);
    return [];
  }
}

/**
 * Récupère tous les logs d'habits quotidiens pour un utilisateur et une date donnée
 * Optimisé pour récupérer tous les logs en une seule requête
 * @param userId - L'ID de l'utilisateur connecté
 * @param date - La date pour laquelle récupérer les logs (par défaut: aujourd'hui)
 * @returns Liste des logs quotidiens pour cette date
 */
export async function getDailyHabitLogs(
  userId: string,
  date: Date = new Date()
): Promise<HabitLog[]> {
  const period = formatDailyPeriod(date);
  return getHabitLogsByPeriod(userId, "daily", period);
}

/**
 * Récupère tous les logs d'habits hebdomadaires pour un utilisateur et une semaine donnée
 * @param userId - L'ID de l'utilisateur connecté
 * @param date - Une date de la semaine pour laquelle récupérer les logs (par défaut: aujourd'hui)
 * @returns Liste des logs hebdomadaires pour cette semaine
 */
export async function getWeeklyHabitLogs(
  userId: string,
  date: Date = new Date()
): Promise<HabitLog[]> {
  const period = getWeekNumber(date);
  return getHabitLogsByPeriod(userId, "weekly", period);
}

/**
 * Récupère tous les logs d'habits mensuels pour un utilisateur et un mois donné
 * @param userId - L'ID de l'utilisateur connecté
 * @param date - Une date du mois pour lequel récupérer les logs (par défaut: aujourd'hui)
 * @returns Liste des logs mensuels pour ce mois
 */
export async function getMonthlyHabitLogs(
  userId: string,
  date: Date = new Date()
): Promise<HabitLog[]> {
  const period = formatMonthlyPeriod(date);
  return getHabitLogsByPeriod(userId, "monthly", period);
}

/**
 * Crée un nouveau log d'habit dans Airtable
 * @param logData - Les données du log à créer
 * @returns Le log créé ou null en cas d'erreur
 */
export async function createHabitLog(
  logData: CreateHabitLogInput
): Promise<{ log: HabitLog | null; error?: string }> {
  try {
    const completedAt = logData.completed_at || new Date().toISOString();
    
    const fields: Record<string, any> = {
      [AIRTABLE_HABITS_LOGS_COMPLETED_AT_FIELD]: completedAt,
      [AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD]: logData.frequency,
      [AIRTABLE_HABITS_LOGS_PERIOD_FIELD]: logData.period,
    };

    // Gérer les champs Link : Airtable nécessite un tableau d'objets avec la propriété "id" pour les champs de type Link
    fields[AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD] = [logData.habit_id];
    fields[AIRTABLE_HABITS_LOGS_USER_ID_FIELD] = [logData.user_id ];

    const [record] = await habitsLogsTable.create([{ fields }]);

    const habitIdField = record.fields[AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD];
    const userIdField = record.fields[AIRTABLE_HABITS_LOGS_USER_ID_FIELD];

    // Extraire les champs bruts et exclure ceux qu'on va redéfinir
    const { 
      [AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD]: _habitIdField,
      [AIRTABLE_HABITS_LOGS_USER_ID_FIELD]: _userIdField,
      ...otherFields 
    } = record.fields;

    const log: HabitLog = {
      id: record.id,
      habit_id: Array.isArray(habitIdField)
        ? (habitIdField as string[])[0]
        : (habitIdField as string),
      user_id: Array.isArray(userIdField)
        ? (userIdField as string[])[0]
        : (userIdField as string),
      completed_at: record.fields[AIRTABLE_HABITS_LOGS_COMPLETED_AT_FIELD] as string,
      frequency: record.fields[AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD] as HabitFrequency,
      period: record.fields[AIRTABLE_HABITS_LOGS_PERIOD_FIELD] as string,
      ...otherFields,
    };

    return { log };
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
  logId: string
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
