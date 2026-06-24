import * as Crypto from 'expo-crypto';

// Salt global pour le hachage des mots de passe
// En production, utilisez une variable d'environnement pour plus de sécurité
const PASSWORD_SALT = process.env.EXPO_PUBLIC_PASSWORD_SALT || 'default-salt-change-in-production';

/**
 * Hash un mot de passe en utilisant SHA-256 avec un salt
 * @param password - Le mot de passe en texte clair
 * @returns Le hash hexadécimal du mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  const saltedPassword = `${password}${PASSWORD_SALT}`;
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    saltedPassword
  );
  return hash;
}

/**
 * Vérifie si un mot de passe correspond à un hash
 * @param password - Le mot de passe en texte clair
 * @param hash - Le hash stocké
 * @returns true si le mot de passe correspond au hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

