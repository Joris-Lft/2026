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

export async function getNoteTagOptions(): Promise<string[]> {
  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
    {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Impossible de charger les tags depuis Airtable");
  }

  const data = (await response.json()) as AirtableMetaResponse;
  const notesTable = data.tables.find(
    (table) => table.name === AIRTABLE_NOTES_TABLE_NAME,
  );
  const tagsField = notesTable?.fields.find(
    (field) => field.name === AIRTABLE_NOTES_TAGS_FIELD,
  );

  if (!tagsField || tagsField.type !== "multipleSelects") {
    return [];
  }

  return (tagsField.options?.choices ?? [])
    .map((choice) => choice.name.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "fr"));
}
