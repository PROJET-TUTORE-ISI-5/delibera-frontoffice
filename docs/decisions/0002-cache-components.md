# 0002 – Cache Components activé

- **Date** : 27 novembre 2026
- **Statut** : acceptée

## Contexte

Next.js 16.4 crée les projets avec `cacheComponents: true` et `partialPrefetching: true`. La documentation annonce que ces deux options seront activées partout dans la version majeure suivante, puis supprimées. Désactiver Cache Components aujourd'hui imposerait une migration plus tard.

Toutes les pages de travail dépendent de la session (lecture des cookies), et les données de délibération changent en séance.

## Décision

Garder `cacheComponents` et `partialPrefetching` activés, avec trois règles (AGENT.md, section 3.4) :

1. toute lecture de la session se fait sous une frontière `<Suspense>` (ou un `loading.tsx`) ;
2. pas de lecture de la session au niveau supérieur d'un layout ;
3. **`"use cache"` et `"use cache: remote"` interdits sur les données de l'API**, `"use cache: private"` seulement avec l'accord de l'équipe.

## Conséquences

- La coquille (barre supérieure, menu vide, squelettes) s'affiche immédiatement ; l'utilisateur, le menu et les données arrivent en flux.
- Nginx ne doit pas mettre ces réponses en mémoire tampon (`proxy_buffering off`, en-tête `X-Accel-Buffering: no`).
- Une lecture de cookies mal placée fait échouer `next build` : le pipeline l'attrape.
- Règle 3 : un cache serveur partagé indexé sans l'école pourrait servir les données d'une école à une autre (BNF12).

## Alternatives écartées

- **`cacheComponents: false`** : modèle plus simple aujourd'hui, mais voué à disparaître ; migration forcée au milieu du projet.
