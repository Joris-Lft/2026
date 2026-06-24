function env(key: keyof ImportMetaEnv, fallback = ""): string {
  const viteValue = import.meta.env[key];
  if (viteValue !== undefined && viteValue !== "") {
    return viteValue;
  }
  if (typeof process !== "undefined" && process.env[key]) {
    return process.env[key]!;
  }
  return fallback;
}

export const AIRTABLE_BASE_ID = env("VITE_AIRTABLE_BASE_ID");
export const AIRTABLE_API_KEY = env("VITE_AIRTABLE_API_KEY");

export const AIRTABLE_TABLE_NAME = env("VITE_AIRTABLE_TABLE_NAME", "Users");
export const AIRTABLE_EMAIL_FIELD = env("VITE_AIRTABLE_EMAIL_FIELD", "Email");
export const AIRTABLE_PASSWORD_FIELD = env("VITE_AIRTABLE_PASSWORD_FIELD", "Password");

export const AIRTABLE_HABITS_TABLE_NAME = env("VITE_AIRTABLE_HABITS_TABLE_NAME", "Habits");
export const AIRTABLE_HABITS_USER_ID_FIELD = env("VITE_AIRTABLE_HABITS_USER_ID_FIELD", "user_id");
export const AIRTABLE_HABITS_NAME_FIELD = env("VITE_AIRTABLE_HABITS_NAME_FIELD", "name");
export const AIRTABLE_HABITS_FREQUENCY_FIELD = env("VITE_AIRTABLE_HABITS_FREQUENCY_FIELD", "frequency");
export const AIRTABLE_HABITS_CREATED_AT_FIELD = env("VITE_AIRTABLE_HABITS_CREATED_AT_FIELD", "created_at");

export const AIRTABLE_HABITS_LOGS_TABLE_NAME = env("VITE_AIRTABLE_HABITS_LOGS_TABLE_NAME", "HabitsLogs");
export const AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD = env("VITE_AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD", "habit_id");
export const AIRTABLE_HABITS_LOGS_USER_ID_FIELD = env("VITE_AIRTABLE_HABITS_LOGS_USER_ID_FIELD", "user_id");
export const AIRTABLE_HABITS_LOGS_COMPLETED_AT_FIELD = env("VITE_AIRTABLE_HABITS_LOGS_COMPLETED_AT_FIELD", "completed_at");
export const AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD = env("VITE_AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD", "frequency");
export const AIRTABLE_HABITS_LOGS_PERIOD_FIELD = env("VITE_AIRTABLE_HABITS_LOGS_PERIOD_FIELD", "period");
