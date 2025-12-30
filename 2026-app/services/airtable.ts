import AsyncStorage from "@react-native-async-storage/async-storage";
import { hashPassword, verifyPassword } from "@/utils/password-hash";

const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID || "";
const AIRTABLE_API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY || "";
const AIRTABLE_TABLE_NAME =
  process.env.EXPO_PUBLIC_AIRTABLE_TABLE_NAME || "Users";
const AIRTABLE_EMAIL_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_EMAIL_FIELD || "Email";
const AIRTABLE_PASSWORD_FIELD =
  process.env.EXPO_PUBLIC_AIRTABLE_PASSWORD_FIELD || "Password";

const AUTH_STORAGE_KEY = "@app_auth_token";
const USER_STORAGE_KEY = "@app_user_data";

export interface User {
  id: string;
  email: string;
  [key: string]: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Recherche un utilisateur dans Airtable par email et vérifie le mot de passe
 */
export async function loginWithAirtable(
  credentials: LoginCredentials
): Promise<{ user: User; token: string } | null> {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    const params = new URLSearchParams({
      filterByFormula: `{${AIRTABLE_EMAIL_FIELD}} = "${credentials.email}"`,
    });

    const response = await fetch(`${url}?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.records.length === 0) {
      return null; // Utilisateur non trouvé
    }

    const userRecord = data.records[0];
    const storedPasswordHash = userRecord.fields[AIRTABLE_PASSWORD_FIELD];

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
      email: userRecord.fields[AIRTABLE_EMAIL_FIELD],
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
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    const params = new URLSearchParams({
      filterByFormula: `{${AIRTABLE_EMAIL_FIELD}} = "${email}"`,
    });

    const response = await fetch(`${url}?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    return data.records.length > 0;
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

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    const fields = {
      [AIRTABLE_EMAIL_FIELD]: email,
      [AIRTABLE_PASSWORD_FIELD]: passwordHash,
      ...additionalFields,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Airtable API error: ${response.status} - ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();
    const user: User = {
      id: data.id,
      email: data.fields[AIRTABLE_EMAIL_FIELD],
      ...data.fields,
    };

    return { user };
  } catch (error) {
    console.error("Create user error:", error);
    return {
      user: null,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la création du compte",
    };
  }
}
