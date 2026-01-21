/**
 * Configuration centralisée pour toutes les constantes Airtable
 * Ce fichier évite la duplication des constantes entre les différents services
 */

// Constantes de base Airtable
export const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID || "";
export const AIRTABLE_API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY || "";

// Constantes pour la table Users
export const AIRTABLE_TABLE_NAME =
  process.env.EXPO_PUBLIC_AIRTABLE_TABLE_NAME || "Users";
export const AIRTABLE_EMAIL_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_EMAIL_FIELD || "Email";
export const AIRTABLE_PASSWORD_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_PASSWORD_FIELD || "Password";

// Constantes pour la table Habits
export const AIRTABLE_HABITS_TABLE_NAME =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_TABLE_NAME || "Habits";
export const AIRTABLE_HABITS_USER_ID_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_USER_ID_FIELD || "user_id";
export const AIRTABLE_HABITS_NAME_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_NAME_FIELD || "name";
export const AIRTABLE_HABITS_FREQUENCY_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_FREQUENCY_FIELD || "frequency";

// Constantes pour la table HabitsLogs
export const AIRTABLE_HABITS_LOGS_TABLE_NAME =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_LOGS_TABLE_NAME || "HabitsLogs";
export const AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD || "habit_id";
export const AIRTABLE_HABITS_LOGS_USER_ID_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_LOGS_USER_ID_FIELD || "user_id";
export const AIRTABLE_HABITS_LOGS_COMPLETED_AT_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_LOGS_COMPLETED_AT_FIELD ||
  "completed_at";
export const AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD || "frequency";
export const AIRTABLE_HABITS_LOGS_PERIOD_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_LOGS_PERIOD_FIELD || "period";
