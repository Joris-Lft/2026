import type { UserDirectory, UserOption } from "@/types/users";
import { AIRTABLE_EMAIL_FIELD } from "./airtable-config";
import { usersTable } from "./airtable-client";

function mapUserRecord(record: {
  id: string;
  fields: Record<string, unknown>;
}): UserOption {
  return {
    id: record.id,
    email: String(record.fields[AIRTABLE_EMAIL_FIELD] ?? ""),
  };
}

export async function getUserDirectory(): Promise<UserDirectory> {
  try {
    const records = await usersTable
      .select({
        fields: [AIRTABLE_EMAIL_FIELD],
        sort: [{ field: AIRTABLE_EMAIL_FIELD, direction: "asc" }],
      })
      .all();

    const users = records.map(mapUserRecord);
    const emailToId = new Map(users.map((user) => [user.email, user.id]));
    const idToEmail = new Map(users.map((user) => [user.id, user.email]));

    return { users, emailToId, idToEmail };
  } catch (error) {
    console.error("Get user directory error:", error);
    return {
      users: [],
      emailToId: new Map(),
      idToEmail: new Map(),
    };
  }
}
