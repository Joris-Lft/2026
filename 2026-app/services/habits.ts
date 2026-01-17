const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID || "";
const AIRTABLE_API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY || "";
const AIRTABLE_HABITS_TABLE_NAME =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_TABLE_NAME || "Habits";
const AIRTABLE_HABITS_USER_ID_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_USER_ID_FIELD || "user_id";
const AIRTABLE_HABITS_NAME_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_NAME_FIELD || "name";
const AIRTABLE_HABITS_FREQUENCY_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_FREQUENCY_FIELD || "frequency";

export type HabitFrequency = "daily" | "weekly" | "monthly";

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  frequency: HabitFrequency;
  [key: string]: any;
}

export interface CreateHabitInput {
  name: string;
  frequency: HabitFrequency;
}

export interface UpdateHabitInput {
  name?: string;
  frequency?: HabitFrequency;
}

/**
 * Crée un nouvel habit dans Airtable
 * @param userId - Le Name de l'utilisateur connecté
 * @param habitData - Les données de l'habit à créer
 * @returns L'habit créé ou null en cas d'erreur
 */
export async function createHabit(
  userId: string,
  habitData: CreateHabitInput
): Promise<{ habit: Habit | null; error?: string }> {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_HABITS_TABLE_NAME}`;
    const fields = {
      [AIRTABLE_HABITS_USER_ID_FIELD]: userId,
      [AIRTABLE_HABITS_NAME_FIELD]: habitData.name,
      [AIRTABLE_HABITS_FREQUENCY_FIELD]: habitData.frequency,
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
    const habit: Habit = {
      id: data.id,
      user_id: data.fields[AIRTABLE_HABITS_USER_ID_FIELD],
      name: data.fields[AIRTABLE_HABITS_NAME_FIELD],
      frequency: data.fields[AIRTABLE_HABITS_FREQUENCY_FIELD],
      ...data.fields,
    };

    return { habit };
  } catch (error) {
    console.error("Create habit error:", error);
    return {
      habit: null,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de l'habit",
    };
  }
}

/**
 * Récupère tous les habits d'un utilisateur
 * @param userId - Le Name de l'utilisateur connecté
 * @returns Liste des habits de l'utilisateur, triés par ordre alphabétique
 */
export async function getHabitsByUser(userId: string): Promise<Habit[]> {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_HABITS_TABLE_NAME}`;
    const params = new URLSearchParams({
      filterByFormula: `{${AIRTABLE_HABITS_USER_ID_FIELD}} = "${userId}"`,
      sort: `[{field: "${AIRTABLE_HABITS_NAME_FIELD}", direction: "asc"}]`,
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
      user_id: record.fields[AIRTABLE_HABITS_USER_ID_FIELD],
      name: record.fields[AIRTABLE_HABITS_NAME_FIELD],
      frequency: record.fields[AIRTABLE_HABITS_FREQUENCY_FIELD],
      ...record.fields,
    }));
  } catch (error) {
    console.error("Get habits by user error:", error);
    return [];
  }
}

/**
 * Récupère les habits quotidiens d'un utilisateur
 * @param userId - Le Name de l'utilisateur connecté
 * @returns Liste des habits quotidiens, triés par ordre alphabétique
 */
export async function getDailyHabits(userId: string): Promise<Habit[]> {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_HABITS_TABLE_NAME}`;
    const params = new URLSearchParams({
      filterByFormula: `AND({${AIRTABLE_HABITS_USER_ID_FIELD}} = "${userId}", {${AIRTABLE_HABITS_FREQUENCY_FIELD}} = "daily")`,
      sort: `[{field: "${AIRTABLE_HABITS_NAME_FIELD}", direction: "asc"}]`,
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
      user_id: record.fields[AIRTABLE_HABITS_USER_ID_FIELD],
      name: record.fields[AIRTABLE_HABITS_NAME_FIELD],
      frequency: record.fields[AIRTABLE_HABITS_FREQUENCY_FIELD],
      ...record.fields,
    }));
  } catch (error) {
    console.error("Get daily habits error:", error);
    return [];
  }
}

/**
 * Récupère les habits hebdomadaires d'un utilisateur
 * @param userId - Le Name de l'utilisateur connecté
 * @returns Liste des habits hebdomadaires, triés par ordre alphabétique
 */
export async function getWeeklyHabits(userId: string): Promise<Habit[]> {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_HABITS_TABLE_NAME}`;
    const params = new URLSearchParams({
      filterByFormula: `AND({${AIRTABLE_HABITS_USER_ID_FIELD}} = "${userId}", {${AIRTABLE_HABITS_FREQUENCY_FIELD}} = "weekly")`,
      sort: `[{field: "${AIRTABLE_HABITS_NAME_FIELD}", direction: "asc"}]`,
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
      user_id: record.fields[AIRTABLE_HABITS_USER_ID_FIELD],
      name: record.fields[AIRTABLE_HABITS_NAME_FIELD],
      frequency: record.fields[AIRTABLE_HABITS_FREQUENCY_FIELD],
      ...record.fields,
    }));
  } catch (error) {
    console.error("Get weekly habits error:", error);
    return [];
  }
}

/**
 * Récupère les habits mensuels d'un utilisateur
 * @param userId - Le Name de l'utilisateur connecté
 * @returns Liste des habits mensuels, triés par ordre alphabétique
 */
export async function getMonthlyHabits(userId: string): Promise<Habit[]> {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_HABITS_TABLE_NAME}`;
    const params = new URLSearchParams({
      filterByFormula: `AND({${AIRTABLE_HABITS_USER_ID_FIELD}} = "${userId}", {${AIRTABLE_HABITS_FREQUENCY_FIELD}} = "monthly")`,
      sort: `[{field: "${AIRTABLE_HABITS_NAME_FIELD}", direction: "asc"}]`,
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
      user_id: record.fields[AIRTABLE_HABITS_USER_ID_FIELD],
      name: record.fields[AIRTABLE_HABITS_NAME_FIELD],
      frequency: record.fields[AIRTABLE_HABITS_FREQUENCY_FIELD],
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
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_HABITS_TABLE_NAME}/${habitId}`;
    const fields: Record<string, any> = {};

    if (updates.name !== undefined) {
      fields[AIRTABLE_HABITS_NAME_FIELD] = updates.name;
    }
    if (updates.frequency !== undefined) {
      fields[AIRTABLE_HABITS_FREQUENCY_FIELD] = updates.frequency;
    }

    const response = await fetch(url, {
      method: "PATCH",
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
    const habit: Habit = {
      id: data.id,
      user_id: data.fields[AIRTABLE_HABITS_USER_ID_FIELD],
      name: data.fields[AIRTABLE_HABITS_NAME_FIELD],
      frequency: data.fields[AIRTABLE_HABITS_FREQUENCY_FIELD],
      ...data.fields,
    };

    return { habit };
  } catch (error) {
    console.error("Update habit error:", error);
    return {
      habit: null,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de l'habit",
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
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_HABITS_TABLE_NAME}/${habitId}`;

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
    console.error("Delete habit error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de l'habit",
    };
  }
}
