export const BUDGET_CATEGORIES = [
  "Transport",
  "Logement",
  "Nourriture",
  "Activités",
  "Autre",
] as const;

export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

export function isBudgetCategory(value: unknown): value is BudgetCategory {
  return (
    typeof value === "string" &&
    (BUDGET_CATEGORIES as readonly string[]).includes(value)
  );
}

export const SPEND_LEVELS = [
  "Strict minimum",
  "Confortable",
  "Royal",
] as const;

export type SpendLevel = (typeof SPEND_LEVELS)[number];

export const DEFAULT_SPEND_LEVEL: SpendLevel = "Confortable";

export function isSpendLevel(value: unknown): value is SpendLevel {
  return (
    typeof value === "string" &&
    (SPEND_LEVELS as readonly string[]).includes(value)
  );
}

/** Budget estimé d'un voyage, détaillé par niveau de dépense. */
export type TravelBudgetTotals = {
  total: number;
  byLevel: Record<SpendLevel, number>;
};

export function emptyBudgetTotals(): TravelBudgetTotals {
  return {
    total: 0,
    byLevel: { "Strict minimum": 0, Confortable: 0, Royal: 0 },
  };
}

export type BudgetLine = {
  id: string;
  category: BudgetCategory;
  label: string;
  estimated: number | null;
  actual: number | null;
  notes: string;
  location: string;
  inBudget: boolean;
  toVisit: boolean;
  spendLevel: SpendLevel;
};

export type BudgetLineInput = {
  category: BudgetCategory;
  label: string;
  estimated: number | null;
  actual: number | null;
  notes: string;
  location: string;
  inBudget: boolean;
  toVisit: boolean;
  spendLevel: SpendLevel;
};

/** Agrège les montants estimés d'un voyage par niveau de dépense. */
export function sumBudgetTotals(lines: BudgetLine[]): TravelBudgetTotals {
  const totals = emptyBudgetTotals();
  for (const line of lines) {
    if (line.estimated == null) continue;
    totals.total += line.estimated;
    totals.byLevel[line.spendLevel] += line.estimated;
  }
  return totals;
}

/** Un item compte dans le budget s'il est explicitement flaggé ou s'il a un prix. */
export function isBudgetItem(line: BudgetLine): boolean {
  return line.inBudget || line.estimated != null || line.actual != null;
}

/** Un item est « à visiter » s'il est flaggé ou s'il a un point GPS. */
export function isVisitItem(line: BudgetLine): boolean {
  return line.toVisit || line.location.trim() !== "";
}

/** Extrait des coordonnées lat,lng depuis une chaîne « lat,lng » ou une URL Google Maps. */
export function parseLatLng(
  location: string,
): { lat: number; lng: number } | null {
  const value = location.trim();
  if (!value) return null;

  const validate = (rawLat: string, rawLng: string) => {
    const lat = Number(rawLat);
    const lng = Number(rawLng);
    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180
    ) {
      return { lat, lng };
    }
    return null;
  };

  // Coordonnées brutes « lat,lng »
  const plain = value.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (plain) return validate(plain[1], plain[2]);

  // URLs Google Maps /place/… : le lieu cliqué est la DERNIÈRE paire !3d!4d
  const placeMatches = [
    ...value.matchAll(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/g),
  ];
  if (placeMatches.length > 0) {
    const last = placeMatches[placeMatches.length - 1];
    const result = validate(last[1], last[2]);
    if (result) return result;
  }

  // Paramètres query= / q=
  const query = value.match(/[?&](?:query|q)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (query) return validate(query[1], query[2]);

  // Centre de la vue @lat,lng (dernier recours)
  const at = value.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (at) return validate(at[1], at[2]);

  return null;
}

export type CreateBudgetLineInput = BudgetLineInput;

export type UpdateBudgetLineInput = BudgetLineInput & {
  id: string;
};
