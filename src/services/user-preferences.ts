import {
  AIRTABLE_SHOW_HABITS_FIELD,
  AIRTABLE_SHOW_MEASURES_FIELD,
} from "./airtable-config";
import { usersTable } from "./airtable-client";
import type { NavigationPreferences } from "@/types/navigation-preferences";

function parseCheckbox(value: unknown): boolean {
  return value === true;
}

export function parseNavigationPreferences(
  fields: Record<string, unknown>,
): NavigationPreferences {
  return {
    habits: parseCheckbox(fields[AIRTABLE_SHOW_HABITS_FIELD]),
    measures: parseCheckbox(fields[AIRTABLE_SHOW_MEASURES_FIELD]),
  };
}

export async function fetchNavigationPreferences(
  userId: string,
): Promise<NavigationPreferences> {
  const record = await usersTable.find(userId);
  return parseNavigationPreferences(record.fields);
}

export async function updateNavigationPreferences(
  userId: string,
  preferences: NavigationPreferences,
): Promise<void> {
  await usersTable.update(userId, {
    [AIRTABLE_SHOW_HABITS_FIELD]: preferences.habits,
    [AIRTABLE_SHOW_MEASURES_FIELD]: preferences.measures,
  });
}

export function getAirtableErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Erreur lors de l'enregistrement de la préférence";
}
