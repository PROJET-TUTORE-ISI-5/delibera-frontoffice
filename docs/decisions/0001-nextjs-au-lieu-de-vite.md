# 0001 – Next.js au lieu de React + Vite

- **Date** : 27 novembre 2026
- **Statut** : acceptée (choix de l'équipe au lancement du dépôt)

## Contexte

Le cahier de conception (tableau 3) prévoit pour la couche de présentation un client monopage : React 18, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Tailwind CSS 4 et Radix UI. Ce client serait servi en fichiers statiques par Nginx et appellerait l'API directement depuis le navigateur, avec le jeton JWT dans l'en-tête `Authorization`.

Un client monopage doit alors garder le jeton dans le navigateur (mémoire, `localStorage`), où un script injecté peut le lire. Le design system Délibéra UI est lui-même servi par un site Next.js, et ses composants sont compatibles avec React 19.

## Décision

Le client web est une application **Next.js 16** (App Router), en TypeScript, avec React 19.3. Le reste de la pile du cahier est conservé : Tailwind CSS 4, Radix UI (par le design system), TanStack Query, React Hook Form, zod.

- Le serveur Next.js garde les jetons dans des cookies `httpOnly` et appelle l'API à la place du navigateur (décision 0004).
- Le routage par fichiers de Next.js remplace React Router.
- Le serveur autonome de Next.js (`output: "standalone"`) tourne dans un conteneur, derrière Nginx.

## Conséquences

- Un processus Node.js de plus sur l'instance (environ 100 à 150 Mo de mémoire) : `front_heap_mb` dans Terraform le limite.
- Le cahier de conception (tableau 3, §5.3) est à mettre à jour : « Next.js 16, React 19 » au lieu de « React 18, Vite, React Router », et un conteneur `front` à côté de Nginx, de l'API et de PostgreSQL.
- Les développeurs doivent connaître les Server Components, les Server Functions et Cache Components (AGENT.md, sections 3 et 15).

## Alternatives écartées

- **React + Vite, jeton en mémoire** : jeton perdu à chaque rechargement, ou stocké là où un script peut le lire.
- **React + Vite, jeton en cookie posé par l'API** : demande des changements dans l'API (cookies, CSRF) et mélange les rôles ; le client resterait sans rendu côté serveur.
