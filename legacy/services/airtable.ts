import AsyncStorage from "@react-native-async-storage/async-storage";
import { hashPassword, verifyPassword } from "@/utils/password-hash";
import {
  AIRTABLE_EMAIL_FIELD,
  AIRTABLE_PASSWORD_FIELD,
} from "./airtable-config";
import { User, LoginCredentials } from "@/types/user";
import { usersTable } from "./airtable-client";

const AUTH_STORAGE_KEY = "@app_auth_token";
const USER_STORAGE_KEY = "@app_user_data";

/**
 * Recherche un utilisateur dans Airtable par email et vérifie le mot de passe
 */
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

    if (records.length === 0) {
      return null; // Utilisateur non trouvé
    }

    const userRecord = records[0];
    const storedPasswordHash = userRecord.fields[AIRTABLE_PASSWORD_FIELD] as string;

    // Vérification du mot de passe hashé
    const isPasswordValid = await verifyPassword(
      credentials.password,
      storedPasswordHash
    );
    if (!isPasswordValid) {
      return null; // Mot de passe incorrect
    }

    // Créer un token simple (en production, utilisez JWT ou un système plus sécurisé)
    const token = `airtable_${userRecord.id}_${Date.now()}`;

    const user: User = {
      id: userRecord.id,
      email: userRecord.fields[AIRTABLE_EMAIL_FIELD] as string,
      ...userRecord.fields,
    };

    // Sauvegarder les données d'authentification
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, token);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    return { user, token };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Déconnecte l'utilisateur en supprimant les données stockées
 */
export async function logout(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

/**
 * Vérifie si l'utilisateur est connecté en vérifiant le token stocké
 */
export async function checkAuthStatus(): Promise<{
  isAuthenticated: boolean;
  user: User | null;
}> {
  try {
    const token = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);

    if (!token || !userData) {
      return { isAuthenticated: false, user: null };
    }

    const user: User = JSON.parse(userData);

    return { isAuthenticated: true, user };
  } catch (error) {
    console.error("Check auth status error:", error);
    return { isAuthenticated: false, user: null };
  }
}

/**
 * Vérifie si un email existe déjà dans Airtable
 * @param email - L'email à vérifier
 * @returns true si l'email existe déjà, false sinon
 */
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

/**
 * Crée un nouvel utilisateur dans Airtable avec un mot de passe hashé
 * Utile pour créer des utilisateurs depuis un script ou une interface d'administration
 * @param email - L'email de l'utilisateur
 * @param password - Le mot de passe en texte clair (sera hashé automatiquement)
 * @param additionalFields - Champs supplémentaires à ajouter à l'utilisateur
 * @returns L'utilisateur créé ou null en cas d'erreur
 */
export async function createUser(
  email: string,
  password: string,
  additionalFields: Record<string, any> = {}
): Promise<{ user: User | null; error?: string }> {
  try {
    // Vérifier si l'email existe déjà
    const exists = await emailExists(email);
    if (exists) {
      return { user: null, error: "Cet email est déjà utilisé" };
    }

    // Hasher le mot de passe avant de l'envoyer
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
    return {
      user: null,
      error:
        error?.message || "Erreur lors de la création du compte",
    };
  }
}
