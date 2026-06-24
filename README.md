# 2026 — Application de tracking d'habitudes

Application web React pour le suivi d'habitudes quotidiennes, hebdomadaires et mensuelles, avec authentification Airtable.

## Stack

- React 19 + TypeScript
- Vite
- react-router v7
- TanStack Query v5
- Airtable (backend)

## Démarrage

```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp env.template .env
# Remplir les variables VITE_* dans .env

# Lancer le serveur de développement
npm run dev
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualiser le build |
| `npm run create-user` | Créer un utilisateur via CLI |

## Structure

```
├── legacy/          # Ancienne app Expo/React Native (archivée)
├── src/
│   ├── pages/       # Écrans (Login, Habits, Profil…)
│   ├── components/  # Composants UI
│   ├── services/    # Couche Airtable
│   ├── hooks/       # TanStack Query + thème
│   └── routes/      # react-router
├── env.template     # Variables d'environnement
└── .env             # Config locale (non versionnée)
```

## Variables d'environnement

Toutes les variables utilisent le préfixe `VITE_` (requis par Vite). Voir `env.template` pour la liste complète.

## Application legacy

L'ancienne application mobile Expo est conservée dans `legacy/` pour référence. Elle n'est plus maintenue activement.
