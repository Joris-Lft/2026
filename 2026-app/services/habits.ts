import {
  AIRTABLE_HABITS_USER_ID_FIELD,
  AIRTABLE_HABITS_NAME_FIELD,
  AIRTABLE_HABITS_FREQUENCY_FIELD,
} from "./airtable-config";
import {
  Habit,
  HabitFrequency,
  CreateHabitInput,
  UpdateHabitInput,
} from "@/types/habits";
import { habitsTable } from "./airtable-client";

/**
 * Crée un nouvel habit dans Airtable
 * @param userId - L'ID de l'utilisateur connecté
 * @param habitData - Les données de l'habit à créer
 * @returns L'habit créé ou null en cas d'erreur
 */
export async function createHabit(
  userId: string,
  habitData: CreateHabitInput
): Promise<{ habit: Habit | null; error?: string }> {
  try {
    const fields: Record<string, any> = {
      [AIRTABLE_HABITS_NAME_FIELD]: habitData.name,
      [AIRTABLE_HABITS_FREQUENCY_FIELD]: habitData.frequency,
    };

    // Si user_id est un champ Link, passer un tableau avec l'ID
    // Sinon, passer directement la valeur
    fields[AIRTABLE_HABITS_USER_ID_FIELD] = userId;

    const [record] = await habitsTable.create([{ fields }]);

    const habit: Habit = {
      id: record.id,
      user_id: Array.isArray(record.fields[AIRTABLE_HABITS_USER_ID_FIELD])
        ? (record.fields[AIRTABLE_HABITS_USER_ID_FIELD] as string[])[0]
        : (record.fields[AIRTABLE_HABITS_USER_ID_FIELD] as string),
      name: record.fields[AIRTABLE_HABITS_NAME_FIELD] as string,
      frequency: record.fields[AIRTABLE_HABITS_FREQUENCY_FIELD] as HabitFrequency,
      ...record.fields,
    };

    return { habit };
  } catch (error: any) {
    console.error("Create habit error:", error);
    return {
      habit: null,
      error: error?.message || "Erreur lors de la création de l'habit",
    };
  }
}

/**
 * Récupère tous les habits d'un utilisateur
 * @param userId - L'ID de l'utilisateur connecté
 * @returns Liste des habits de l'utilisateur, triés par ordre alphabétique
 */
export async function getHabitsByUser(userId: string): Promise<Habit[]> {
  try {
    const records = await habitsTable
      .select({
        filterByFormula: `{${AIRTABLE_HABITS_USER_ID_FIELD}} = "${userId}"`,
        sort: [{ field: AIRTABLE_HABITS_NAME_FIELD, direction: "asc" }],
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      user_id: Array.isArray(record.fields[AIRTABLE_HABITS_USER_ID_FIELD])
        ? (record.fields[AIRTABLE_HABITS_USER_ID_FIELD] as string[])[0]
        : (record.fields[AIRTABLE_HABITS_USER_ID_FIELD] as string),
      name: record.fields[AIRTABLE_HABITS_NAME_FIELD] as string,
      frequency: record.fields[AIRTABLE_HABITS_FREQUENCY_FIELD] as HabitFrequency,
      ...record.fields,
    }));
  } catch (error) {
    console.error("Get habits by user error:", error);
    return [];
  }
}

/**
 * Récupère les habits quotidiens d'un utilisateur
 * @param userId - L'email de l'utilisateur connecté
 * @returns Liste des habits quotidiens, triés par ordre alphabétique
 */
// todo: ajouter la vérification si présence dans les logs
export async function getDailyHabits(userId: string): Promise<Habit[]> {
  try {
    const records = await habitsTable
      .select({
        filterByFormula: `AND({${AIRTABLE_HABITS_USER_ID_FIELD}} = "${userId}", {${AIRTABLE_HABITS_FREQUENCY_FIELD}} = "daily")`,
        sort: [{ field: AIRTABLE_HABITS_NAME_FIELD, direction: "asc" }],
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      user_id: Array.isArray(record.fields[AIRTABLE_HABITS_USER_ID_FIELD])
        ? (record.fields[AIRTABLE_HABITS_USER_ID_FIELD] as string[])[0]
        : (record.fields[AIRTABLE_HABITS_USER_ID_FIELD] as string),
      name: record.fields[AIRTABLE_HABITS_NAME_FIELD] as string,
      frequency: record.fields[AIRTABLE_HABITS_FREQUENCY_FIELD] as HabitFrequency,
      ...record.fields,
    }));
  } catch (error) {
    console.error("Get daily habits error:", error);
    return [];
  }
}

/**
 * Récupère les habits hebdomadaires d'un utilisateur
 * @param userId - L'ID de l'utilisateur connecté
 * @returns Liste des habits hebdomadaires, triés par ordre alphabétique
 */
export async function getWeeklyHabits(userId: string): Promise<Habit[]> {
  try {
    const records = await habitsTable
      .select({
        filterByFormula: `AND({${AIRTABLE_HABITS_USER_ID_FIELD}} = "${userId}", {${AIRTABLE_HABITS_FREQUENCY_FIELD}} = "weekly")`,
        sort: [{ field: AIRTABLE_HABITS_NAME_FIELD, direction: "asc" }],
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      user_id: Array.isArray(record.fields[AIRTABLE_HABITS_USER_ID_FIELD])
        ? (record.fields[AIRTABLE_HABITS_USER_ID_FIELD] as string[])[0]
        : (record.fields[AIRTABLE_HABITS_USER_ID_FIELD] as string),
      name: record.fields[AIRTABLE_HABITS_NAME_FIELD] as string,
      frequency: record.fields[AIRTABLE_HABITS_FREQUENCY_FIELD] as HabitFrequency,
      ...record.fields,
    }));
  } catch (error) {
    console.error("Get weekly habits error:", error);
    return [];
  }
}

/**
 * Récupère les habits mensuels d'un utilisateur
 * @param userId - L'ID de l'utilisateur connecté
 * @returns Liste des habits mensuels, triés par ordre alphabétique
 */
export async function getMonthlyHabits(userId: string): Promise<Habit[]> {
  try {
    const records = await habitsTable
      .select({
        filterByFormula: `AND({${AIRTABLE_HABITS_USER_ID_FIELD}} = "${userId}", {${AIRTABLE_HABITS_FREQUENCY_FIELD}} = "monthly")`,
        sort: [{ field: AIRTABLE_HABITS_NAME_FIELD, direction: "asc" }],
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      user_id: Array.isArray(record.fields[AIRTABLE_HABITS_USER_ID_FIELD])
        ? (record.fields[AIRTABLE_HABITS_USER_ID_FIELD] as string[])[0]
        : (record.fields[AIRTABLE_HABITS_USER_ID_FIELD] as string),
      name: record.fields[AIRTABLE_HABITS_NAME_FIELD] as string,
      frequency: record.fields[AIRTABLE_HABITS_FREQUENCY_FIELD] as HabitFrequency,
      ...record.fields,
    }));
  } catch (error) {
    console.error("Get monthly habits error:", error);
    return [];
  }
}

/**
 * Met à jour un habit existant
 * @param habitId - L'ID de l'habit à modifier
 * @param updates - Les champs à mettre à jour
 * @returns L'habit mis à jour ou null en cas d'erreur
 */
export async function updateHabit(
  habitId: string,
  updates: UpdateHabitInput
): Promise<{ habit: Habit | null; error?: string }> {
  try {
    const fields: Record<string, any> = {};

    if (updates.name !== undefined) {
      fields[AIRTABLE_HABITS_NAME_FIELD] = updates.name;
    }
    if (updates.frequency !== undefined) {
      fields[AIRTABLE_HABITS_FREQUENCY_FIELD] = updates.frequency;
    }

    const [record] = await habitsTable.update([{ id: habitId, fields }]);

    const habit: Habit = {
      id: record.id,
      user_id: Array.isArray(record.fields[AIRTABLE_HABITS_USER_ID_FIELD])
        ? (record.fields[AIRTABLE_HABITS_USER_ID_FIELD] as string[])[0]
        : (record.fields[AIRTABLE_HABITS_USER_ID_FIELD] as string),
      name: record.fields[AIRTABLE_HABITS_NAME_FIELD] as string,
      frequency: record.fields[AIRTABLE_HABITS_FREQUENCY_FIELD] as HabitFrequency,
      ...record.fields,
    };

    return { habit };
  } catch (error: any) {
    console.error("Update habit error:", error);
    return {
      habit: null,
      error: error?.message || "Erreur lors de la mise à jour de l'habit",
    };
  }
}

/**
 * Supprime un habit
 * @param habitId - L'ID de l'habit à supprimer
 * @returns true si la suppression a réussi, false sinon
 */
export async function deleteHabit(
  habitId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await habitsTable.destroy([habitId]);
    return { success: true };
  } catch (error: any) {
    console.error("Delete habit error:", error);
    return {
      success: false,
      error: error?.message || "Erreur lors de la suppression de l'habit",
    };
  }
}
