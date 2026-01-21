/**
 * Client Airtable initialisé avec le SDK officiel
 * Ce fichier configure et exporte les instances de base et de tables
 */

import Airtable from "airtable";
import {
  AIRTABLE_BASE_ID,
  AIRTABLE_API_KEY,
  AIRTABLE_TABLE_NAME,
  AIRTABLE_HABITS_TABLE_NAME,
  AIRTABLE_HABITS_LOGS_TABLE_NAME,
} from "./airtable-config";

// Configuration globale du SDK Airtable
Airtable.configure({
  apiKey: AIRTABLE_API_KEY,
});

// Instance de la base Airtable
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// Export des tables
export const usersTable = base(AIRTABLE_TABLE_NAME);
export const habitsTable = base(AIRTABLE_HABITS_TABLE_NAME);
export const habitsLogsTable = base(AIRTABLE_HABITS_LOGS_TABLE_NAME);

// Export de l'instance de base pour usage avancé si nécessaire
export default base;
