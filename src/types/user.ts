/**
 * Types centralisés pour les utilisateurs et l'authentification
 */

/**
 * Représente un utilisateur dans l'application
 */
export interface User {
  id: string;
  email: string;
  [key: string]: any;
}

/**
 * Credentials pour la connexion d'un utilisateur
 */
export interface LoginCredentials {
  email: string;
  password: string;
}
