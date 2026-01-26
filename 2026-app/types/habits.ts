/**
 * Types centralisés pour les habits
 * Ce fichier contient tous les types liés au domaine métier des habits
 */

/**
 * Fréquence d'un habit : quotidien, hebdomadaire ou mensuel
 */
export type HabitFrequency = "daily" | "weekly" | "monthly";

/**
 * Représente un habit dans l'application
 */
export interface Habit {
  id: string;
  user_id: string;
  name: string;
  frequency: HabitFrequency;
  [key: string]: any;
}

/**
 * Données nécessaires pour créer un nouvel habit
 */
export interface CreateHabitInput {
  name: string;
  frequency: HabitFrequency;
  createdAt: string;
  [key: string]: any;
}

/**
 * Données pour mettre à jour un habit existant
 */
export interface UpdateHabitInput {
  name?: string;
  frequency?: HabitFrequency;
  [key: string]: any;
}

/**
 * Représente un log d'habit (enregistrement de complétion)
 */
export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  frequency: HabitFrequency;
  period: string;
  [key: string]: any;
}

/**
 * Données nécessaires pour créer un nouveau log d'habit
 */
export interface CreateHabitLogInput {
  habit_id: string;
  user_id: string;
  completed_at?: string; // Si non fourni, utilise la date actuelle
  frequency: HabitFrequency;
  period: string;
}
