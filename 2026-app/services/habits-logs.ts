const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID || "";
const AIRTABLE_API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY || "";
const AIRTABLE_HABITS_LOGS_TABLE_NAME =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_LOGS_TABLE_NAME || "HabitsLogs";
const AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD || "habit_id";
const AIRTABLE_HABITS_LOGS_USER_ID_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_LOGS_USER_ID_FIELD || "user_id";
const AIRTABLE_HABITS_LOGS_COMPLETED_AT_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_LOGS_COMPLETED_AT_FIELD ||
  "completed_at";
const AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD || "frequency";
const AIRTABLE_HABITS_LOGS_PERIOD_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_LOGS_PERIOD_FIELD || "period";

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  frequency: "daily" | "weekly" | "monthly";
  period: string;
  [key: string]: any;
}

export interface CreateHabitLogInput {
  habit_id: string;
  user_id: string;
  completed_at?: string; // Si non fourni, utilise la date actuelle
  frequency: "daily" | "weekly" | "monthly";
  period: string;
}

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
 * @param userId - Le Name de l'utilisateur connecté
 * @param frequency - La fréquence (daily, weekly, monthly)
 * @param period - La période (format dépend de la fréquence)
 * @returns Liste des logs correspondants
 */
export async function getHabitLogsByPeriod(
  userId: string,
  frequency: "daily" | "weekly" | "monthly",
  period: string
): Promise<HabitLog[]> {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_HABITS_LOGS_TABLE_NAME}`;
    const params = new URLSearchParams({
      filterByFormula: `AND({${AIRTABLE_HABITS_LOGS_USER_ID_FIELD}} = "${userId}", {${AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD}} = "${frequency}", {${AIRTABLE_HABITS_LOGS_PERIOD_FIELD}} = "${period}")`,
    });

    const response = await fetch(`${url}?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    return data.records.map((record: any) => ({
      id: record.id,
      habit_id: record.fields[AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD],
      user_id: record.fields[AIRTABLE_HABITS_LOGS_USER_ID_FIELD],
      completed_at: record.fields[AIRTABLE_HABITS_LOGS_COMPLETED_AT_FIELD],
      frequency: record.fields[AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD],
      period: record.fields[AIRTABLE_HABITS_LOGS_PERIOD_FIELD],
      ...record.fields,
    }));
  } catch (error) {
    console.error("Get habit logs by period error:", error);
    return [];
  }
}

/**
 * Récupère tous les logs d'habits quotidiens pour un utilisateur et une date donnée
 * Optimisé pour récupérer tous les logs en une seule requête
 * @param userId - Le Name de l'utilisateur connecté
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
 * @param userId - Le Name de l'utilisateur connecté
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
 * @param userId - Le Name de l'utilisateur connecté
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
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_HABITS_LOGS_TABLE_NAME}`;
    const completedAt = logData.completed_at || new Date().toISOString();
    
    const fields = {
      [AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD]: logData.habit_id,
      [AIRTABLE_HABITS_LOGS_USER_ID_FIELD]: logData.user_id,
      [AIRTABLE_HABITS_LOGS_COMPLETED_AT_FIELD]: completedAt,
      [AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD]: logData.frequency,
      [AIRTABLE_HABITS_LOGS_PERIOD_FIELD]: logData.period,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Airtable API error: ${response.status} - ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();
    const log: HabitLog = {
      id: data.id,
      habit_id: data.fields[AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD],
      user_id: data.fields[AIRTABLE_HABITS_LOGS_USER_ID_FIELD],
      completed_at: data.fields[AIRTABLE_HABITS_LOGS_COMPLETED_AT_FIELD],
      frequency: data.fields[AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD],
      period: data.fields[AIRTABLE_HABITS_LOGS_PERIOD_FIELD],
      ...data.fields,
    };

    return { log };
  } catch (error) {
    console.error("Create habit log error:", error);
    return {
      log: null,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la création du log",
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
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_HABITS_LOGS_TABLE_NAME}/${logId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Airtable API error: ${response.status} - ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Delete habit log error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression du log",
    };
  }
}
