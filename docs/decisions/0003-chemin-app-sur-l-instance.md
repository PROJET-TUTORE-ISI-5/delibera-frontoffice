# 0003 – Client web servi sous /app, en conteneur sur le réseau de la machine

- **Date** : 27 novembre 2026
- **Statut** : acceptée

## Contexte

L'instance EC2 n'a pas encore de nom de domaine : tout passe par `http://15.188.107.127`. Nginx y sert déjà :
- le design system Délibéra UI sur `/` (`/docs`, `/r/*.json` pour la CLI, `/_next/` pour ses fichiers) ;
- l'API sur `/api/` et sa documentation sur `/swagger-ui.html`.

Le client web a besoin d'un emplacement qui ne casse ni les adresses de la registry (utilisées par la CLI et `components.json`) ni celles de l'API. Seuls les ports 22 et 80 sont ouverts.

## Décision

- Le client web est servi sous **`/app`** (`basePath: "/app"` dans `next.config.ts`, modifiable à la construction par `DELIBERA_BASE_PATH`).
- Nginx relaie `/app` et `/app/` vers `127.0.0.1:3002` (`scripts/frontend-setup.sh`, dépôt `infra`).
- Le conteneur utilise le **réseau de la machine** (`network_mode: host`), écoute sur `127.0.0.1:3002` et joint l'API sur `127.0.0.1:8080`, là où elle est déjà publiée.

## Conséquences

- Client web et API partagent la même origine : pas de CORS, et des cookies limités à `/app`.
- Les fichiers de Next.js du client sont sous `/app/_next/`, sans conflit avec ceux du design system.
- Le jour où un domaine existe (par exemple `delibera.exemple.cm`), on peut garder `/app` ou servir le client à la racine d'un sous-domaine (reconstruire avec `DELIBERA_BASE_PATH=`), puis passer `DELIBERA_COOKIES_SECURISES=true` avec HTTPS.
- Le conteneur n'est pas isolé du réseau de la machine ; il tourne sous un utilisateur sans privilèges et n'écoute que sur l'interface locale.

## Alternatives écartées

- **Client à la racine, design system déplacé** : casse les adresses de la registry déjà distribuées.
- **Nouveau port public (3000)** : modifie le groupe de sécurité, origine différente de l'API (CORS, cookies).
- **Conteneur dans le réseau compose de l'API** : couple les deux projets compose ; le client ne démarre plus si l'API est arrêtée.
