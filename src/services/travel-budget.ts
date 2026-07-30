import {
  BUDGET_CATEGORIES,
  DEFAULT_SPEND_LEVEL,
  emptyBudgetTotals,
  isBudgetCategory,
  isSpendLevel,
  type BudgetLine,
  type CreateBudgetLineInput,
  type TravelBudgetTotals,
  type UpdateBudgetLineInput,
} from "@/types/travel-budget";
import { travelBudgetTable } from "./airtable-client";
import {
  AIRTABLE_TRAVEL_BUDGET_ACTUAL_FIELD,
  AIRTABLE_TRAVEL_BUDGET_CATEGORY_FIELD,
  AIRTABLE_TRAVEL_BUDGET_ESTIMATED_FIELD,
  AIRTABLE_TRAVEL_BUDGET_IN_BUDGET_FIELD,
  AIRTABLE_TRAVEL_BUDGET_LABEL_FIELD,
  AIRTABLE_TRAVEL_BUDGET_LOCATION_FIELD,
  AIRTABLE_TRAVEL_BUDGET_NOTES_FIELD,
  AIRTABLE_TRAVEL_BUDGET_SPEND_LEVEL_FIELD,
  AIRTABLE_TRAVEL_BUDGET_TO_VISIT_FIELD,
  AIRTABLE_TRAVEL_BUDGET_TRAVEL_ID_FIELD,
} from "./airtable-config";

function buildTravelFilter(travelId: string): string {
  return `{${AIRTABLE_TRAVEL_BUDGET_TRAVEL_ID_FIELD}} = "${travelId}"`;
}

function mapNumber(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function mapRecordToBudgetLine(record: {
  id: string;
  fields: Record<string, unknown>;
}): BudgetLine {
  const rawCategory = record.fields[AIRTABLE_TRAVEL_BUDGET_CATEGORY_FIELD];
  const rawSpendLevel = record.fields[AIRTABLE_TRAVEL_BUDGET_SPEND_LEVEL_FIELD];
  return {
    id: record.id,
    category: isBudgetCategory(rawCategory) ? rawCategory : "Autre",
    label: String(record.fields[AIRTABLE_TRAVEL_BUDGET_LABEL_FIELD] ?? ""),
    estimated: mapNumber(record.fields[AIRTABLE_TRAVEL_BUDGET_ESTIMATED_FIELD]),
    actual: mapNumber(record.fields[AIRTABLE_TRAVEL_BUDGET_ACTUAL_FIELD]),
    notes: String(record.fields[AIRTABLE_TRAVEL_BUDGET_NOTES_FIELD] ?? ""),
    location: String(record.fields[AIRTABLE_TRAVEL_BUDGET_LOCATION_FIELD] ?? ""),
    inBudget: record.fields[AIRTABLE_TRAVEL_BUDGET_IN_BUDGET_FIELD] === true,
    toVisit: record.fields[AIRTABLE_TRAVEL_BUDGET_TO_VISIT_FIELD] === true,
    spendLevel: isSpendLevel(rawSpendLevel) ? rawSpendLevel : DEFAULT_SPEND_LEVEL,
  };
}

function sortBudgetLines(lines: BudgetLine[]): BudgetLine[] {
  return [...lines].sort((a, b) => {
    const byCategory =
      BUDGET_CATEGORIES.indexOf(a.category) -
      BUDGET_CATEGORIES.indexOf(b.category);
    if (byCategory !== 0) return byCategory;
    return a.label.localeCompare(b.label, "fr");
  });
}

function buildLineFields(
  travelId: string,
  input: CreateBudgetLineInput | UpdateBudgetLineInput,
): Record<string, unknown> {
  return {
    [AIRTABLE_TRAVEL_BUDGET_TRAVEL_ID_FIELD]: travelId,
    [AIRTABLE_TRAVEL_BUDGET_CATEGORY_FIELD]: input.category,
    [AIRTABLE_TRAVEL_BUDGET_LABEL_FIELD]: input.label.trim(),
    [AIRTABLE_TRAVEL_BUDGET_ESTIMATED_FIELD]: input.estimated,
    [AIRTABLE_TRAVEL_BUDGET_ACTUAL_FIELD]: input.actual,
    [AIRTABLE_TRAVEL_BUDGET_NOTES_FIELD]: input.notes.trim(),
    [AIRTABLE_TRAVEL_BUDGET_LOCATION_FIELD]: input.location.trim(),
    [AIRTABLE_TRAVEL_BUDGET_IN_BUDGET_FIELD]: input.inBudget,
    [AIRTABLE_TRAVEL_BUDGET_TO_VISIT_FIELD]: input.toVisit,
    [AIRTABLE_TRAVEL_BUDGET_SPEND_LEVEL_FIELD]: input.spendLevel,
  };
}

export async function getBudgetForTravel(
  travelId: string,
): Promise<BudgetLine[]> {
  const records = await travelBudgetTable
    .select({ filterByFormula: buildTravelFilter(travelId) })
    .all();

  return sortBudgetLines(records.map(mapRecordToBudgetLine));
}

/**
 * Budget estimé par voyage, détaillé par niveau de dépense, en une seule
 * requête (pour la liste des voyages). Les lignes sans montant estimé
 * n'entrent pas dans le total.
 */
export async function getEstimatedTotalsByTravel(): Promise<
  Record<string, TravelBudgetTotals>
> {
  const records = await travelBudgetTable
    .select({
      fields: [
        AIRTABLE_TRAVEL_BUDGET_TRAVEL_ID_FIELD,
        AIRTABLE_TRAVEL_BUDGET_ESTIMATED_FIELD,
        AIRTABLE_TRAVEL_BUDGET_SPEND_LEVEL_FIELD,
      ],
    })
    .all();

  const totals: Record<string, TravelBudgetTotals> = {};
  for (const record of records) {
    const travelId = record.fields[AIRTABLE_TRAVEL_BUDGET_TRAVEL_ID_FIELD];
    const estimated = mapNumber(
      record.fields[AIRTABLE_TRAVEL_BUDGET_ESTIMATED_FIELD],
    );
    if (typeof travelId !== "string" || estimated == null) continue;

    const rawLevel = record.fields[AIRTABLE_TRAVEL_BUDGET_SPEND_LEVEL_FIELD];
    const level = isSpendLevel(rawLevel) ? rawLevel : DEFAULT_SPEND_LEVEL;

    const entry = (totals[travelId] ??= emptyBudgetTotals());
    entry.total += estimated;
    entry.byLevel[level] += estimated;
  }
  return totals;
}

export async function createBudgetLine(
  travelId: string,
  input: CreateBudgetLineInput,
): Promise<{ line: BudgetLine | null; error?: string }> {
  try {
    if (!input.label.trim()) {
      return { line: null, error: "Le libellé est requis" };
    }
    const records = await travelBudgetTable.create([
      { fields: buildLineFields(travelId, input) as never },
    ]);
    return { line: mapRecordToBudgetLine(records[0]) };
  } catch (error: unknown) {
    console.error("Create budget line error:", error);
    return {
      line: null,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de la ligne",
    };
  }
}

export async function updateBudgetLine(
  travelId: string,
  input: UpdateBudgetLineInput,
): Promise<{ line: BudgetLine | null; error?: string }> {
  try {
    if (!input.label.trim()) {
      return { line: null, error: "Le libellé est requis" };
    }
    const records = await travelBudgetTable.update([
      { id: input.id, fields: buildLineFields(travelId, input) as never },
    ]);
    return { line: mapRecordToBudgetLine(records[0]) };
  } catch (error: unknown) {
    console.error("Update budget line error:", error);
    return {
      line: null,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de la ligne",
    };
  }
}

export async function deleteBudgetLine(
  lineId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await travelBudgetTable.destroy([lineId]);
    return { success: true };
  } catch (error: unknown) {
    console.error("Delete budget line error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de la ligne",
    };
  }
}
