# Welcome to your Expo app 👋

> **Archivé** — Cette application Expo/React Native est conservée pour référence. L'application active est désormais la version React web à la racine du dépôt.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

3. Build the app for android

   ```bash
   eas build -p android --profile preview
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Authentification avec Airtable

L'application utilise Airtable comme backend pour l'authentification des utilisateurs.

### Configuration

1. **Créer une base Airtable** :

   - Créez une nouvelle base dans [Airtable](https://airtable.com)
   - Créez une table nommée `Users` (ou le nom que vous préférez)
   - Ajoutez les colonnes suivantes :
     - `Email` (type: Email ou Single line text)
     - `Password` (type: Single line text)
     - Vous pouvez ajouter d'autres colonnes selon vos besoins

2. **Récupérer les identifiants Airtable** :

   - **Base ID** : Trouvez-le dans l'URL de votre base : `https://airtable.com/[BASE_ID]/...`
   - **API Key** : Générez-la dans [Account Settings > Developer options](https://airtable.com/account)

3. **Configurer les variables d'environnement** :

   - Créez un fichier `.env` à la racine du projet (ou utilisez `app.json` avec `extra`)
   - Ajoutez les variables suivantes :

   ```env
   EXPO_PUBLIC_AIRTABLE_BASE_ID=votre_base_id
   EXPO_PUBLIC_AIRTABLE_API_KEY=votre_api_key
   EXPO_PUBLIC_AIRTABLE_TABLE_NAME=Users
   EXPO_PUBLIC_AIRTABLE_EMAIL_FIELD=Email
   EXPO_PUBLIC_AIRTABLE_PASSWORD_FIELD=Password
   EXPO_PUBLIC_PASSWORD_SALT=votre_salt_secret_changez_moi
   ```

   **Note** :

   - Les variables `EXPO_PUBLIC_*` sont accessibles côté client. Pour la production, utilisez des variables d'environnement sécurisées.
   - **IMPORTANT** : Changez le `EXPO_PUBLIC_PASSWORD_SALT` par une valeur aléatoire et secrète. Ce salt est utilisé pour hasher les mots de passe.

### Structure des fichiers

- **`services/airtable.ts`** : Service pour interagir avec l'API Airtable

  - `loginWithAirtable()` : Authentifie un utilisateur avec email/mot de passe (le mot de passe est hashé automatiquement)
  - `logout()` : Déconnecte l'utilisateur
  - `checkAuthStatus()` : Vérifie l'état d'authentification
  - `createUser()` : Crée un nouvel utilisateur avec un mot de passe hashé
  - `emailExists()` : Vérifie si un email existe déjà dans Airtable

- **`utils/password-hash.ts`** : Utilitaires pour le hachage des mots de passe

  - `hashPassword()` : Hash un mot de passe en utilisant SHA-256 avec un salt
  - `verifyPassword()` : Vérifie si un mot de passe correspond à un hash

- **`contexts/auth-context.tsx`** : Contexte React pour gérer l'état d'authentification

  - Fournit `useAuth()` hook pour accéder aux fonctions d'authentification
  - Gère automatiquement la persistance de la session

- **`app/login.tsx`** : Écran de connexion

  - Formulaire avec email et mot de passe
  - Validation des champs
  - Gestion des erreurs
  - Lien vers l'inscription

- **`app/signup.tsx`** : Écran d'inscription

  - Formulaire avec email, mot de passe et confirmation
  - Validation du format email
  - Vérification de la correspondance des mots de passe
  - Vérification de l'unicité de l'email
  - Lien vers la connexion

- **`app/_layout.tsx`** : Layout principal
  - Affiche l'écran de connexion si non authentifié
  - Affiche les tabs si authentifié
  - Gère le chargement initial

### Utilisation

#### S'inscrire

L'utilisateur peut créer un compte depuis l'écran d'inscription :

1. Entrer son email (validation du format)
2. Choisir un mot de passe (minimum 6 caractères)
3. Confirmer le mot de passe
4. L'application vérifie que l'email n'existe pas déjà
5. Hash le mot de passe avec SHA-256 + salt
6. Crée l'utilisateur dans Airtable avec le hash
7. Affiche un message de succès et redirige vers la connexion

#### Se connecter

L'utilisateur doit entrer son email et mot de passe dans l'écran de connexion. L'application :

1. Hash le mot de passe côté client avant l'envoi
2. Recherche l'utilisateur dans Airtable par email
3. Compare le hash du mot de passe avec le hash stocké dans Airtable
4. Sauvegarde la session dans AsyncStorage
5. Redirige vers l'application principale

**Important** : Les mots de passe sont hashés avec SHA-256 et un salt avant d'être comparés. Les mots de passe stockés dans Airtable doivent être des hashs, pas du texte clair.

#### Se déconnecter

Depuis l'onglet **Profil** :

1. Cliquez sur le bouton "Se déconnecter"
2. Confirmez la déconnexion
3. L'application supprime la session et redirige vers l'écran de connexion

#### Accéder aux données utilisateur

Dans n'importe quel composant :

```typescript
import { useAuth } from "@/contexts/auth-context";

function MyComponent() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    console.log("User email:", user?.email);
    // Accéder aux autres champs de l'utilisateur
  }
}
```

### Sécurité

✅ **Mots de passe hashés** : Les mots de passe sont maintenant hashés avec SHA-256 et un salt avant d'être stockés et comparés.

**Fonctionnement** :

- Le mot de passe est hashé côté client avant l'envoi à Airtable
- Les mots de passe stockés dans Airtable sont des hashs (jamais du texte clair)
- La comparaison se fait entre hashs, jamais avec le texte clair

**Recommandations supplémentaires pour la production** :

1. **Changez le salt** : Utilisez une valeur aléatoire et secrète pour `EXPO_PUBLIC_PASSWORD_SALT`
2. **Utilisez HTTPS** : Assurez-vous que toutes les communications sont chiffrées
3. **Validez côté serveur** : Implémentez une validation robuste
4. **Utilisez JWT** : Pour les tokens d'authentification plus sécurisés
5. **Rate limiting** : Limitez les tentatives de connexion
6. **Considérez bcrypt** : Pour une sécurité encore plus élevée, vous pourriez migrer vers bcrypt (nécessite un backend)

### Créer des utilisateurs avec des mots de passe hashés

Pour créer un nouvel utilisateur dans Airtable, vous devez stocker le hash du mot de passe, pas le texte clair.

**Option 1 : Utiliser l'écran d'inscription dans l'application**

Les utilisateurs peuvent s'inscrire directement depuis l'application via l'écran d'inscription (`/signup`).

**Option 2 : Utiliser la fonction `createUser()`**

```typescript
import { createUser } from "@/services/airtable";

// Cette fonction hash automatiquement le mot de passe et vérifie l'unicité de l'email
const result = await createUser("user@example.com", "motdepasse123");
if (result.user) {
  console.log("Utilisateur créé:", result.user);
} else {
  console.error("Erreur:", result.error);
}
```

**Option 2 : Hasher manuellement et ajouter dans Airtable**

```typescript
import { hashPassword } from "@/utils/password-hash";

const passwordHash = await hashPassword("motdepasse123");
// Ajoutez ensuite cet hash dans le champ Password de votre table Airtable
```

**Important** : Ne stockez JAMAIS de mots de passe en texte clair dans Airtable. Utilisez toujours les fonctions de hachage fournies.

### Personnalisation

Vous pouvez personnaliser les noms de champs et de table en modifiant les variables d'environnement dans `services/airtable.ts` ou via les variables d'environnement.

### Dépannage

- **Erreur "Airtable API error"** : Vérifiez que votre API Key et Base ID sont corrects
- **Utilisateur non trouvé** : Vérifiez que l'email existe dans votre base Airtable
- **Mot de passe incorrect** :
  - Vérifiez que le mot de passe dans Airtable est un hash (pas du texte clair)
  - Si vous avez des utilisateurs existants avec des mots de passe en texte clair, vous devez les convertir en hash
  - Utilisez `hashPassword()` pour générer le hash correct
- **Session perdue** : La session est stockée localement, elle persiste entre les redémarrages de l'app
- **Migration des mots de passe existants** : Si vous avez des utilisateurs avec des mots de passe en texte clair, vous devez :
  1. Récupérer chaque mot de passe
  2. Le hasher avec `hashPassword()`
  3. Remplacer le texte clair par le hash dans Airtable
