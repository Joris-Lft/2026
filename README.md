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

## Déploiement (GitHub Pages)

Le site est déployé automatiquement sur chaque push vers `main` via GitHub Actions.

**URL :** https://joris-lft.github.io/2026/

### Configuration initiale (une seule fois)

1. **Activer GitHub Pages** — Dans le dépôt GitHub : *Settings → Pages → Build and deployment → Source* : choisir **GitHub Actions**.

2. **Ajouter le secret `ENV_FILE`** — *Settings → Secrets and variables → Actions → New repository secret* :
   - Nom : `ENV_FILE`
   - Valeur : le contenu complet de votre fichier `.env` local (toutes les variables `VITE_*`)

3. **Merger dans `main`** — Le workflow `.github/workflows/deploy.yml` build et publie le dossier `dist/`.

### Notes techniques

- Le `base` Vite est `/2026/` en production (sous-chemin du dépôt GitHub).
- Un `404.html` est généré au build pour le routage SPA (react-router).
- Le fichier `public/.nojekyll` désactive le traitement Jekyll de GitHub Pages.

## Application legacy

L'ancienne application mobile Expo est conservée dans `legacy/` pour référence. Elle n'est plus maintenue activement.
