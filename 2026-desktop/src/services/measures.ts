import type { CreateMeasureInput, Measure, UpdateMeasureInput } from "@/types/measures";
import { measureTable } from "./airtable-client";
import {
  AIRTABLE_MEASURES_ARM_FIELD,
  AIRTABLE_MEASURES_BUST_FIELD,
  AIRTABLE_MEASURES_DATE_FIELD,
  AIRTABLE_MEASURES_HIP_FIELD,
  AIRTABLE_MEASURES_THIGH_FIELD,
  AIRTABLE_MEASURES_USER_ID_FIELD,
  AIRTABLE_MEASURES_WAIST_FIELD,
  AIRTABLE_MEASURES_WEIGHT_FIELD,
} from "./airtable-config";

export async function createMeasure(
  userId: string,
  measureData: CreateMeasureInput,
  date: string
): Promise<{ measure: Measure | null; error?: string }> {
  try {
    const fields: Record<string, any> = {
      [AIRTABLE_MEASURES_DATE_FIELD]: date,
      [AIRTABLE_MEASURES_WEIGHT_FIELD]: measureData.weight,
      [AIRTABLE_MEASURES_ARM_FIELD]: measureData.arm,
      [AIRTABLE_MEASURES_BUST_FIELD]: measureData.bust,
      [AIRTABLE_MEASURES_WAIST_FIELD]: measureData.waist,
      [AIRTABLE_MEASURES_HIP_FIELD]: measureData.hip,
      [AIRTABLE_MEASURES_THIGH_FIELD]: measureData.thigh,
      [AIRTABLE_MEASURES_USER_ID_FIELD]: [userId],
    };

    const [record] = await measureTable.create([{ fields }]);

    const measure: Measure = {
      id: record.id,
      date: record.fields[AIRTABLE_MEASURES_DATE_FIELD] as string,
      weight: record.fields[AIRTABLE_MEASURES_WEIGHT_FIELD] as number,
      arm: record.fields[AIRTABLE_MEASURES_ARM_FIELD] as number,
      bust: record.fields[AIRTABLE_MEASURES_BUST_FIELD] as number,
      waist: record.fields[AIRTABLE_MEASURES_WAIST_FIELD] as number,
      hip: record.fields[AIRTABLE_MEASURES_HIP_FIELD] as number,
      thigh: record.fields[AIRTABLE_MEASURES_THIGH_FIELD] as number,
      ...record.fields,
    };

    return { measure };
  } catch (error: any) {
    console.error("Create measure error:", error);
    return { measure: null, error: error?.message || "Erreur lors de la création de la mensuration" };
  }
}

export async function getMeasuresByUser(userId: string): Promise<Measure[]> {
  try {
    const records = await measureTable
      .select({
        filterByFormula: `{${AIRTABLE_MEASURES_USER_ID_FIELD}} = "${userId}"`,
        sort: [{ field: AIRTABLE_MEASURES_DATE_FIELD, direction: "desc" }],
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      date: record.fields[AIRTABLE_MEASURES_DATE_FIELD] as string,
      weight: record.fields[AIRTABLE_MEASURES_WEIGHT_FIELD] as number,
      arm: record.fields[AIRTABLE_MEASURES_ARM_FIELD] as number,
      bust: record.fields[AIRTABLE_MEASURES_BUST_FIELD] as number,
      waist: record.fields[AIRTABLE_MEASURES_WAIST_FIELD] as number,
      hip: record.fields[AIRTABLE_MEASURES_HIP_FIELD] as number,
      thigh: record.fields[AIRTABLE_MEASURES_THIGH_FIELD] as number,
      ...record.fields,
    }));
  } catch (error) {
    console.error("Get measures by user error:", error);
    return [];
  }
}

export async function updateMeasure(
  updates: UpdateMeasureInput
): Promise<{ measure: Measure | null; error?: string }> {
  try {
    const fields: Record<string, any> = {};
    if (updates.date !== undefined) fields[AIRTABLE_MEASURES_DATE_FIELD] = updates.date;
    if (updates.weight !== undefined) fields[AIRTABLE_MEASURES_WEIGHT_FIELD] = updates.weight;
    if (updates.arm !== undefined) fields[AIRTABLE_MEASURES_ARM_FIELD] = updates.arm;
    if (updates.bust !== undefined) fields[AIRTABLE_MEASURES_BUST_FIELD] = updates.bust;
    if (updates.waist !== undefined) fields[AIRTABLE_MEASURES_WAIST_FIELD] = updates.waist;
    if (updates.hip !== undefined) fields[AIRTABLE_MEASURES_HIP_FIELD] = updates.hip;
    if (updates.thigh !== undefined) fields[AIRTABLE_MEASURES_THIGH_FIELD] = updates.thigh;

    const [record] = await measureTable.update([{ id: updates.id, fields }]);

    const measure: Measure = {
      id: record.id,
      date: record.fields[AIRTABLE_MEASURES_DATE_FIELD] as string,
      weight: record.fields[AIRTABLE_MEASURES_WEIGHT_FIELD] as number,
      arm: record.fields[AIRTABLE_MEASURES_ARM_FIELD] as number,
      bust: record.fields[AIRTABLE_MEASURES_BUST_FIELD] as number,
      waist: record.fields[AIRTABLE_MEASURES_WAIST_FIELD] as number,
      hip: record.fields[AIRTABLE_MEASURES_HIP_FIELD] as number,
      thigh: record.fields[AIRTABLE_MEASURES_THIGH_FIELD] as number,
      ...record.fields,
    };

    return { measure };
  } catch (error: any) {
    console.error("Update measure error:", error);
    return { measure: null, error: error?.message || "Erreur lors de la mise à jour de la mensuration" };
  }
}

export async function deleteMeasure(
  measureId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await measureTable.destroy([measureId]);
    return { success: true };
  } catch (error: any) {
    console.error("Delete measure error:", error);
    return { success: false, error: error?.message || "Erreur lors de la suppression de la mensuration" };
  }
}
