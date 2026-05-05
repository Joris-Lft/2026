import Airtable from "airtable";
import {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
  AIRTABLE_HABITS_LOGS_TABLE_NAME,
  AIRTABLE_HABITS_TABLE_NAME,
  AIRTABLE_MEASURES_TABLE_NAME,
  AIRTABLE_TABLE_NAME,
} from "./airtable-config";

Airtable.configure({ apiKey: AIRTABLE_API_KEY });

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export const usersTable = base(AIRTABLE_TABLE_NAME);
export const habitsTable = base(AIRTABLE_HABITS_TABLE_NAME);
export const habitsLogsTable = base(AIRTABLE_HABITS_LOGS_TABLE_NAME);
export const measureTable = base(AIRTABLE_MEASURES_TABLE_NAME);

export default base;
