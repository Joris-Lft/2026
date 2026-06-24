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
export const AIRTABLE_HABITS_CREATED_AT_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_HABITS_CREATED_AT_FIELD || "created_at";

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

// Constantes pour la table Measures
export const AIRTABLE_MEASURES_TABLE_NAME =
  process.env.EXPO_PUBLIC_AIRTABLE_MEASURES_TABLE_NAME || "Measures";
export const AIRTABLE_MEASURES_MEASURE_ID_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_MEASURES_MEASURE_ID_FIELD || "measure_id";
export const AIRTABLE_MEASURES_USER_ID_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_MEASURES_USER_ID_FIELD || "user_id";
export const AIRTABLE_MEASURES_DATE_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_MEASURES_DATE_FIELD || "date";
export const AIRTABLE_MEASURES_WEIGHT_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_MEASURES_WEIGHT_FIELD || "weight";
export const AIRTABLE_MEASURES_ARM_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_MEASURES_ARM_FIELD || "arm";
export const AIRTABLE_MEASURES_BUST_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_MEASURES_BUST_FIELD || "bust";
export const AIRTABLE_MEASURES_WAIST_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_MEASURES_WAIST_FIELD || "waist";
export const AIRTABLE_MEASURES_HIP_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_MEASURES_HIP_FIELD || "hip";
export const AIRTABLE_MEASURES_THIGH_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_MEASURES_THIGH_FIELD || "thigh";
