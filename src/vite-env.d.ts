/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AIRTABLE_BASE_ID: string;
  readonly VITE_AIRTABLE_API_KEY: string;
  readonly VITE_AIRTABLE_TABLE_NAME: string;
  readonly VITE_AIRTABLE_EMAIL_FIELD: string;
  readonly VITE_AIRTABLE_PASSWORD_FIELD: string;
  readonly VITE_AIRTABLE_HABITS_TABLE_NAME: string;
  readonly VITE_AIRTABLE_HABITS_USER_ID_FIELD: string;
  readonly VITE_AIRTABLE_HABITS_NAME_FIELD: string;
  readonly VITE_AIRTABLE_HABITS_FREQUENCY_FIELD: string;
  readonly VITE_AIRTABLE_HABITS_CREATED_AT_FIELD: string;
  readonly VITE_AIRTABLE_HABITS_LOGS_TABLE_NAME: string;
  readonly VITE_AIRTABLE_HABITS_LOGS_HABIT_ID_FIELD: string;
  readonly VITE_AIRTABLE_HABITS_LOGS_USER_ID_FIELD: string;
  readonly VITE_AIRTABLE_HABITS_LOGS_COMPLETED_AT_FIELD: string;
  readonly VITE_AIRTABLE_HABITS_LOGS_FREQUENCY_FIELD: string;
  readonly VITE_AIRTABLE_HABITS_LOGS_PERIOD_FIELD: string;
  readonly VITE_PASSWORD_SALT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
