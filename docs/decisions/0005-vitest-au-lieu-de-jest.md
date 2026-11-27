# 0005 – Vitest au lieu de Jest

- **Date** : 27 novembre 2026
- **Statut** : acceptée

## Contexte

Le cahier de conception (tableau 3) cite Jest et React Testing Library pour les tests de l'interface. Les dépendances du client (Radix UI, lucide-react, sonner, TanStack Query) sont publiées en modules ES, que Jest ne charge qu'avec une configuration de transformation supplémentaire. La documentation de Next.js 16 décrit Vitest et Jest de la même façon.

## Décision

Les tests unitaires et de composants utilisent **Vitest** avec **React Testing Library** et jsdom (`vitest.config.mts`). L'API d'écriture des tests (`describe`, `it`, `expect`) est celle de Jest.

## Conséquences

- Aucune transformation à configurer pour les modules ES ; démarrage et mode « en continu » rapides.
- Le cahier de conception (tableau 3, ligne « Tests ») est à mettre à jour : « Vitest, React Testing Library ».
- Comme avec Jest, les Server Components asynchrones ne se testent pas unitairement : leur logique est isolée dans des fonctions testables, et le pipeline fait un test de fumée de l'image.

## Alternatives écartées

- **Jest avec `next/jest`** : possible, mais demande de lister les paquets ES à transformer, et reste plus lent.
