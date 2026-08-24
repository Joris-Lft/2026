import { mergeOptions } from "@/utils/options";
import {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
  AIRTABLE_NOTES_TABLE_NAME,
  AIRTABLE_NOTES_TAGS_FIELD,
} from "./airtable-config";

type AirtableFieldChoice = {
  id: string;
  name: string;
};

type AirtableField = {
  id: string;
  name: string;
  type: string;
  options?: {
    choices?: AirtableFieldChoice[];
  };
};

type AirtableTable = {
  id: string;
  name: string;
  fields: AirtableField[];
};

type AirtableMetaResponse = {
  tables: AirtableTable[];
};

const SELECT_FIELD_TYPES: readonly string[] = [
  "singleSelect",
  "multipleSelects",
];

/**
 * Choix configurés dans Airtable pour un champ de type select, dans l'ordre
 * défini sur la base. Retourne une liste vide si le champ est introuvable ou
 * n'est pas un select.
 */
export async function getSelectFieldOptions(
  tableName: string,
  fieldName: string,
): Promise<string[]> {
  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
    {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Impossible de charger les options du champ ${tableName}.${fieldName} depuis Airtable`,
    );
  }

  const data = (await response.json()) as AirtableMetaResponse;
  const table = data.tables.find((item) => item.name === tableName);
  const field = table?.fields.find((item) => item.name === fieldName);

  if (!field || !SELECT_FIELD_TYPES.includes(field.type)) {
    return [];
  }

  return mergeOptions((field.options?.choices ?? []).map((choice) => choice.name));
}

export function getNoteTagOptions(): Promise<string[]> {
  return getSelectFieldOptions(
    AIRTABLE_NOTES_TABLE_NAME,
    AIRTABLE_NOTES_TAGS_FIELD,
  );
}
