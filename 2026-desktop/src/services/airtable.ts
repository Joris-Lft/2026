import { hashPassword, verifyPassword } from "@/utils/password-hash";
import { AIRTABLE_EMAIL_FIELD, AIRTABLE_PASSWORD_FIELD } from "./airtable-config";
import type { User, LoginCredentials } from "@/types/user";
import { usersTable } from "./airtable-client";

const AUTH_STORAGE_KEY = "@app_auth_token";
const USER_STORAGE_KEY = "@app_user_data";

export async function loginWithAirtable(
  credentials: LoginCredentials
): Promise<{ user: User; token: string } | null> {
  try {
    const records = await usersTable
      .select({
        filterByFormula: `{${AIRTABLE_EMAIL_FIELD}} = "${credentials.email}"`,
        maxRecords: 1,
      })
      .firstPage();

    if (records.length === 0) return null;

    const userRecord = records[0];
    const storedPasswordHash = userRecord.fields[AIRTABLE_PASSWORD_FIELD] as string;

    const isPasswordValid = await verifyPassword(credentials.password, storedPasswordHash);
    if (!isPasswordValid) return null;

    const token = `airtable_${userRecord.id}_${Date.now()}`;

    const user: User = {
      id: userRecord.id,
      email: userRecord.fields[AIRTABLE_EMAIL_FIELD] as string,
      ...userRecord.fields,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    return { user, token };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export async function checkAuthStatus(): Promise<{
  isAuthenticated: boolean;
  user: User | null;
}> {
  try {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    const userData = localStorage.getItem(USER_STORAGE_KEY);

    if (!token || !userData) return { isAuthenticated: false, user: null };

    const user: User = JSON.parse(userData);
    return { isAuthenticated: true, user };
  } catch (error) {
    console.error("Check auth status error:", error);
    return { isAuthenticated: false, user: null };
  }
}

export async function emailExists(email: string): Promise<boolean> {
  try {
    const records = await usersTable
      .select({
        filterByFormula: `{${AIRTABLE_EMAIL_FIELD}} = "${email}"`,
        maxRecords: 1,
      })
      .firstPage();
    return records.length > 0;
  } catch (error) {
    console.error("Email exists check error:", error);
    return false;
  }
}

export async function createUser(
  email: string,
  password: string,
  additionalFields: Record<string, any> = {}
): Promise<{ user: User | null; error?: string }> {
  try {
    const exists = await emailExists(email);
    if (exists) return { user: null, error: "Cet email est déjà utilisé" };

    const passwordHash = await hashPassword(password);

    const fields = {
      [AIRTABLE_EMAIL_FIELD]: email,
      [AIRTABLE_PASSWORD_FIELD]: passwordHash,
      ...additionalFields,
    };

    const [record] = await usersTable.create([{ fields }]);

    const user: User = {
      id: record.id,
      email: record.fields[AIRTABLE_EMAIL_FIELD] as string,
      ...record.fields,
    };

    return { user };
  } catch (error: any) {
    console.error("Create user error:", error);
    return { user: null, error: error?.message || "Erreur lors de la création du compte" };
  }
}
