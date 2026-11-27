# 0004 – Jetons dans des cookies httpOnly et relais côté serveur (backend for frontend)

- **Date** : 27 novembre 2026
- **Statut** : acceptée ; le contrat des routes `/auth/**` reste à aligner avec l'API (**[Proposition]** côté `delibera-core-api`)

## Contexte

L'API authentifie chaque requête par un jeton JWT de 15 min dans l'en-tête `Authorization`, renouvelable avec un jeton de renouvellement (cahier de conception §2.2 et §6.1.7, M1). Les données manipulées sont des notes et des identités d'étudiants (loi n° 2024/017). Un jeton lisible par le JavaScript de la page peut être volé par un script injecté.

## Décision

- À la connexion, une **Server Function** appelle `POST /api/v1/auth/connexion`, reçoit les jetons et les place dans des cookies **`httpOnly`, `SameSite=Strict`, `Path=/app`** (`Secure` dès que le site est en HTTPS).
- Les **Server Components** appellent l'API côté serveur avec le jeton du cookie (`lireApi`).
- Le navigateur n'appelle jamais l'API directement : il passe par le **relais** `/app/api/v1/…` (Route Handler), qui ajoute le jeton, renouvelle la session si besoin et renvoie la réponse telle quelle.
- `proxy.ts` renouvelle la session lors des navigations et renvoie vers `/connexion` quand elle est perdue.
- Les routes `/auth/**` ne sont jamais relayées : seules les Server Functions les appellent, si bien que le jeton de renouvellement ne transite jamais par le navigateur.

## Conséquences

- Aucun changement de sécurité dans l'API : elle reste une API à jetons, sans cookie.
- Protection contre les requêtes forgées : `SameSite=Strict`, contrôle d'origine du relais pour les modifications, contrôle d'origine natif des Server Functions.
- Un saut réseau de plus (navigateur → Next.js → API), local à l'instance.
- Le relais limite les en-têtes transmis et la taille des fichiers (12 Mo côté Nginx).
- Le contrat attendu de l'API est écrit dans `src/modules/securite/SPEC.md` ; il doit être confirmé quand M1 sera codé.

## Alternatives écartées

- **Jeton dans `localStorage`** : exposé à tout script injecté.
- **Cookies posés par l'API** : demande des changements dans `SecuriteConfig` (CSRF, CORS) et lie l'API au navigateur.
- **Relais par `rewrites` de Next.js** : ne peut pas ajouter le jeton ni renouveler la session.
