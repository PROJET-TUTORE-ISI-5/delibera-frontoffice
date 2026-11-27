# delibera-frontoffice

Client web de **Delibera**, la plateforme de délibération des étudiants de Saint Jean Ingénieur (SJI) et Saint Jean School of Management (SJM), projet tutoré de la Branche ISI.

Chaque école est un client autonome du service (SaaS) : ses utilisateurs ne voient que ses données. Le client web n'accède qu'à l'API Delibera ([`delibera-core-api`](https://github.com/PROJET-TUTORE-ISI-5/delibera-core-api)) et applique le design system [Délibéra UI](https://github.com/PROJET-TUTORE-ISI-5/delibera-ui). Il ne calcule rien : l'API calcule, propose et contrôle les droits ; le client affiche et recueille les décisions du jury.

La conception de référence est le **cahier de conception** (version en ligne la plus récente) : modules M1 à M10, charte graphique (§6.3), composants par écran (tableau 8) et maquettes (§6.4). Chaque module du client en reprend les écrans dans son `SPEC.md`. Les règles de contribution sont dans [AGENT.md](AGENT.md).

En production : **http://15.188.107.127/app** (le design system reste sur `/`, l'API sur `/api/`).

## Technologies

| Couche | Choix |
| --- | --- |
| Cadre | Next.js 16.4 (App Router, Turbopack, Cache Components), React 19.3, TypeScript 5.9 |
| Interface | Délibéra UI (composants Radix UI copiés par la CLI `delibera-ui`), Tailwind CSS 4, police Inter embarquée |
| Données | TanStack Query 5 (navigateur), Server Components et Server Functions (serveur), zod 4, React Hook Form 7 |
| Accès à l'API | « Backend for frontend » : jetons en cookies `httpOnly`, relais `/app/api/v1` |
| Tests | Vitest 5, Testing Library, jsdom |
| Qualité | ESLint 9, Prettier 3, TypeScript strict |
| Livraison | Docker (`node:24-alpine`, serveur autonome), GitHub Actions, ghcr.io, EC2 (Terraform, dépôt `infra`) |

Écarts avec le cahier de conception (tableau 3, qui prévoyait React 18, Vite et React Router) : voir `docs/decisions/0001-nextjs-au-lieu-de-vite.md` et `0005-vitest-au-lieu-de-jest.md`.

## Prérequis

- **Node.js 24** (`.nvmrc`) et **pnpm 10.18** : `corepack enable` suffit, la version est lue dans `package.json`.
- Pour travailler avec l'API : `delibera-core-api` lancé en local (http://localhost:8080). Sinon, la **session fictive**.
- Pour ajouter des composants du design system : le dépôt `delibera-ui` cloné à côté de celui-ci (`../delibera-ui`).
- Docker Desktop, seulement pour vérifier l'image de production.

## Démarrer en local

```bash
pnpm install
cp .env.example .env.local     # Windows : copy .env.example .env.local
pnpm dev                       # http://localhost:3000/app
```

Deux façons de travailler :

| Mode | Réglage dans `.env.local` | Pour |
| --- | --- | --- |
| Avec l'API locale | `DELIBERA_API_URL=http://localhost:8080` | Toute fonctionnalité qui lit ou écrit des données |
| Session fictive | `DELIBERA_SESSION_FICTIVE=true` | Construire la coquille et les écrans avant que l'API d'authentification existe : un utilisateur fictif avec les permissions d'un gestionnaire académique et d'un président de jury |

La session fictive est ignorée en production. Avec elle, les appels de données échouent tant que l'API n'est pas lancée.

### Commandes

| Commande | Rôle |
| --- | --- |
| `pnpm dev` | Serveur de développement (rechargement à chaud) |
| `pnpm verifier` | ESLint, types TypeScript, tests, Prettier : à lancer avant chaque commit poussé |
| `pnpm build` puis `pnpm start` | Version de production en local |
| `pnpm test` / `pnpm test:watch` / `pnpm test:couverture` | Tests Vitest (une fois, en continu, avec couverture dans `coverage/`) |
| `pnpm format` | Mise en forme Prettier |
| `pnpm ds:ajouter <composant…>` | Ajoute des composants du design system (CLI de `../delibera-ui`) |
| `docker compose up -d --build` | Image de production en local, http://localhost:3000/app (API attendue sur le poste, port 8080) |

## Organisation du code

```
src/
├── proxy.ts              garde de navigation : session absente -> /connexion ; renouvellement transparent
├── app/                  routes (pages minces)
│   ├── (public)/         CU00, CU18 : connexion, code, mot de passe oublié, réinitialisation, activation
│   ├── (compte)/         changement de mot de passe imposé
│   ├── (espace)/         espace connecté : tableau de bord et un espace par module
│   ├── api/[...chemin]/  relais vers l'API (appels du navigateur)
│   └── sante/            sonde de santé
├── components/ui/        design system Délibéra UI (ne pas modifier)
├── components/espace/    coquille, menu, contrôle d'accès, formulaires
├── lib/                  api/ (appels et erreurs RFC 9457), session/ (cookies), routes, navigation, permissions, format
├── modules/<module>/     SPEC.md, types, appels, actions, composants de chaque module
└── test/                 configuration et fabriques de données fictives
```

| Dossier | Module (cahier de conception) | Espace | Itération |
| --- | --- | --- | --- |
| `securite` | M1 Sécurité et accès | Connexion, utilisateurs, rôles | 1 |
| `ecoles` | M2 Écoles clientes | Console de la plateforme | 1 |
| `referentiel` | M3 Référentiel et maquettes | Référentiel académique | 1 |
| `importation` | M5 Import | Import des données, rattrapages | 1 et 2 |
| `regles` | M4 Règles et paramètres | Règles de passage, paramètres | 2 |
| `deliberation` | M6 et M7 Calcul, délibération et jury | Délibérations, séance du jury | 2 à 4 |
| `documents` | M8 Documents et statistiques | PV, listes, statistiques | 4 |
| `audit` | M9 Audit | Journal d'audit | 4 |

Ce qui est en place : l'authentification complète côté client (connexion, double authentification, renouvellement, déconnexion, mot de passe oublié, activation, changement imposé), la coquille de l'espace connecté avec le menu filtré par permissions, le relais vers l'API, et une page par espace qui en donne le cadre. Les écrans métier arrivent avec les itérations.

## Architecture en bref

- **Chemin `/app`** : sur l'instance, Nginx sert le design system sur `/`, l'API sur `/api/` et le client web sur `/app/` (`docs/decisions/0003-chemin-app-sur-l-instance.md`).
- **Jetons hors de portée du navigateur** : à la connexion, une Server Function reçoit les jetons de l'API et les place dans des cookies `httpOnly`, `SameSite=Strict`, limités à `/app`. Les Server Components lisent l'API côté serveur ; le navigateur passe par le relais `/app/api/v1/…`, qui ajoute le jeton (`docs/decisions/0004-bff-jetons-en-cookies.md`).
- **Session** : jeton d'accès de 15 min, renouvelé automatiquement par `proxy.ts` (navigation) ou par le relais (appels du navigateur) avec le jeton de renouvellement. L'inactivité de plus de 30 min et la révocation sont contrôlées par l'API.
- **Permissions** : `/api/v1/moi` donne les permissions et les jurys de l'utilisateur ; le menu et les écrans s'y adaptent. La sécurité reste dans l'API (algorithme A8).

Détails et diagrammes : [docs/architecture.md](docs/architecture.md).

## Déploiement continu

**Chaque push sur `main` déploie le client web en production**, en conteneur, sur l'instance EC2 gérée par Terraform (dépôt `PROJET-TUTORE-ISI-5/infra`). Sur l'instance, le conteneur `front` (`deploy/compose.prod.yaml`) utilise le réseau de la machine : il écoute sur `127.0.0.1:3002`, où Nginx relaie `/app/`, et joint l'API sur `127.0.0.1:8080`.

| Étape | Où | Détail |
| --- | --- | --- |
| 1. Vérifications | GitHub Actions | ESLint, types, Prettier, tests Vitest avec couverture, construction Next.js |
| 2. Image | GitHub Actions | Construction du `Dockerfile`, puis test de fumée avec `deploy/compose.prod.yaml` : `/app/sante` annonce la bonne version, `/app` renvoie vers la connexion, le relais répond 401 sans session |
| 3. Publication | GitHub Actions → ghcr.io | `ghcr.io/projet-tutore-isi-5/delibera-frontoffice:<commit>` (et `:main`) |
| 4. Activation | EC2 | Nouvelle version dans `/opt/delibera-front/releases/<commit>`, lien `current` basculé, `docker compose up -d` |
| 5. Contrôle de santé | EC2 | `/app/sante` doit répondre `UP` en moins de 90 s, **sinon retour automatique à la version précédente** |
| 6. Vérification | GitHub Actions → Internet | `http://<EC2_HOST>/app/sante` doit annoncer le commit déployé |

- **Retour arrière manuel** : Actions > CI/CD > *Run workflow* sur `main`, action `revenir`. **Redéploiement** : même écran, action `deployer`.
- **Sur l'instance** : `sudo delibera-front-compose ps`, `sudo delibera-front-compose logs -f front`, `cat /opt/delibera-front/current/version.env`.
- **Configuration de production** : `/etc/delibera-front/delibera-front.env`, créé par Terraform (`scripts/frontend-setup.sh` du dépôt `infra`). Il ne contient aucun secret.
- **GitHub** : variable `EC2_HOST` et secret `EC2_SSH_KEY`, définis au niveau de l'organisation (le dépôt est public, ils s'appliquent sans autre réglage). Le registre ghcr.io utilise le jeton de GitHub Actions.
- **Préalable** : l'instance doit avoir été préparée pour le client web (`terraform apply` dans le dépôt `infra`, ressource `terraform_data.front_setup`). Sinon le déploiement s'arrête avec un message qui le dit.

## Configuration

Voir `.env.example`. Variables : `DELIBERA_API_URL` (adresse de l'API vue du serveur Next.js), `DELIBERA_COOKIES_SECURISES` (`true` dès que le site est en HTTPS), `DELIBERA_DUREE_RENOUVELLEMENT`, `DELIBERA_DELAI_API_MS`, `DELIBERA_SESSION_FICTIVE` (développement seulement). À la construction : `DELIBERA_VERSION` (commit affiché et renvoyé par `/app/sante`) et `DELIBERA_BASE_PATH` (`/app` par défaut).

## Feuille de route

Quatre itérations de deux semaines, alignées sur l'API (cahier de conception, section 4.1) :

1. **Socle** : connexion et comptes (CU00, CU12, CU16, CU18), écoles clientes (CU15), référentiel (CU01), import (CU03).
2. **Calcul** : règles et paramètres (CU02, CU13), rattrapages (CU07), pré-délibération (CU04).
3. **Séance du jury** : composition du jury (CU17), cas critiques (CU05), décisions et relèvements (CU06).
4. **Clôture et suivi** : validation (CU08), PV et listes (CU09), statistiques (CU10), audit (CU11), réclamations (CU14).
