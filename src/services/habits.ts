import { format } from "date-fns";
import type {
  CreateHabitInput,
  Habit,
  HabitFrequency,
  UpdateHabitInput,
} from "@/types/habits";
import { habitsTable } from "./airtable-client";
import {
  AIRTABLE_HABITS_CREATED_AT_FIELD,
  AIRTABLE_HABITS_DELETED_DATE_FIELD,
  AIRTABLE_HABITS_FREQUENCY_FIELD,
  AIRTABLE_HABITS_IS_ACTIVE_FIELD,
  AIRTABLE_HABITS_NAME_FIELD,
  AIRTABLE_HABITS_USER_ID_FIELD,
} from "./airtable-config";
import { formulaValue } from "./airtable-formula";
import { firstLinkedId } from "./airtable-record";

function toHabit(record: { id: string; fields: Record<string, unknown> }): Habit {
  // Les champs bruts d'abord : les valeurs normalisées ci-dessous doivent
  // l'emporter (`user_id` arrive d'Airtable sous forme de tableau).
  return {
    ...record.fields,
    id: record.id,
    user_id: firstLinkedId(record.fields[AIRTABLE_HABITS_USER_ID_FIELD]) ?? "",
    name: record.fields[AIRTABLE_HABITS_NAME_FIELD] as string,
    frequency: record.fields[AIRTABLE_HABITS_FREQUENCY_FIELD] as HabitFrequency,
    // Normalisé ici : le nom du champ Airtable est configurable, mais
    // l'historique a besoin d'une clé stable.
    created_at: record.fields[AIRTABLE_HABITS_CREATED_AT_FIELD] as
      | string
      | undefined,
  };
}

export async function createHabit(
  userId: string,
  habitData: CreateHabitInput,
): Promise<{ habit: Habit | null; error?: string }> {
  try {
    const fields: Record<string, any> = {
      [AIRTABLE_HABITS_NAME_FIELD]: habitData.name,
      [AIRTABLE_HABITS_FREQUENCY_FIELD]: habitData.frequency,
      [AIRTABLE_HABITS_CREATED_AT_FIELD]: habitData.createdAt,
      [AIRTABLE_HABITS_USER_ID_FIELD]: [userId],
      [AIRTABLE_HABITS_IS_ACTIVE_FIELD]: true,
    };

    const [record] = await habitsTable.create([{ fields }]);

    return { habit: toHabit(record) };
  } catch (error: any) {
    console.error("Create habit error:", error);
    return {
      habit: null,
      error: error?.message || "Erreur lors de la création de l'habit",
    };
  }
}

/**
 * Récupère les habits actifs d'un utilisateur, toutes fréquences confondues.
 *
 * Une seule requête sert les trois périodes affichées : le tri par fréquence se
 * fait côté client.
 * Laisse remonter l'erreur : une liste vide serait indiscernable d'un
 * utilisateur sans habit, et ferait recréer des logs déjà existants.
 * @param userId - L'email de l'utilisateur (valeur affichée du champ lié)
 * @returns Liste des habits actifs, triés par ordre alphabétique
 */
export async function getActiveHabits(userId: string): Promise<Habit[]> {
  try {
    const records = await habitsTable
      .select({
        filterByFormula: `AND({${AIRTABLE_HABITS_USER_ID_FIELD}} = ${formulaValue(userId)}, {${AIRTABLE_HABITS_IS_ACTIVE_FIELD}})`,
        sort: [{ field: AIRTABLE_HABITS_NAME_FIELD, direction: "asc" }],
      })
      .all();

    return records.map(toHabit);
  } catch (error) {
    // On trace puis on relaie : l'appelant doit voir l'échec, pas une liste vide.
    console.error("Get active habits error:", error);
    throw error;
  }
}

/**
 * Met à jour un habit existant
 * @param updates - Les champs à mettre à jour
 * @returns L'habit mis à jour ou null en cas d'erreur
 */
export async function updateHabit(
  updates: UpdateHabitInput,
): Promise<{ habit: Habit | null; error?: string }> {
  try {
    const fields: Record<string, any> = {};

    if (updates.name !== undefined) {
      fields[AIRTABLE_HABITS_NAME_FIELD] = updates.name;
    }
    if (updates.frequency !== undefined) {
      fields[AIRTABLE_HABITS_FREQUENCY_FIELD] = updates.frequency;
    }
    if (updates.createdAt !== undefined) {
      fields[AIRTABLE_HABITS_CREATED_AT_FIELD] = updates.createdAt;
    }

    const [record] = await habitsTable.update([{ id: updates.id, fields }]);

    return { habit: toHabit(record) };
  } catch (error: any) {
    console.error("Update habit error:", error);
    return {
      habit: null,
      error: error?.message || "Erreur lors de la mise à jour de l'habit",
    };
  }
}

/**
 * Archive un habit : il disparaît des listes mais ses logs conservent leur lien,
 * donc l'historique reste exploitable.
 * @param habitId - L'ID de l'habit à archiver
 * @returns true si l'archivage a réussi, false sinon
 */
export async function deleteHabit(
  habitId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await habitsTable.update([
      {
        id: habitId,
        fields: {
          [AIRTABLE_HABITS_IS_ACTIVE_FIELD]: false,
          [AIRTABLE_HABITS_DELETED_DATE_FIELD]: format(
            new Date(),
            "yyyy-MM-dd",
          ),
        },
      },
    ]);
    return { success: true };
  } catch (error: any) {
    console.error("Delete habit error:", error);
    return {
      success: false,
      error: error?.message || "Erreur lors de la suppression de l'habit",
    };
  }
}
