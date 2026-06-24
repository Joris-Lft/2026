/**
 * Types pour le tracking et l'affichage des périodes
 */

/**
 * Type de période pour l'affichage UI (différent de HabitFrequency)
 */
export type PeriodType = "day" | "week" | "month";

/**
 * Type de tracking utilisé pour les données mockées (déprécié)
 * @deprecated Ce type était utilisé avant l'intégration des appels API
 */
export type Tracking = {
  id: string;
  title: string;
  completed: boolean;
  type: PeriodType;
};

/**
 * Données d'une période de tracking
 */
export type PeriodData = {
  key: string;
  trackings: Tracking[];
  period: PeriodType;
};

/**
 * Item de tracking avec log pour l'affichage dans PeriodTracking
 */
export type PeriodTrackingItem = {
  id: string;
  title: string;
  completed: boolean;
  logId?: string; // ID du log si l'habit est complété
};
