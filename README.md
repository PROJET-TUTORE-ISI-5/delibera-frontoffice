# delibera-frontoffice

Client web (Next.js 16) de **Delibera**, la plateforme de délibération des étudiants de Saint Jean Ingénieur (SJI) et Saint Jean School of Management (SJM) — projet tutoré, Branche ISI.

> Dépôt en cours de mise en place : le CI/CD, l'image Docker et la documentation complète (AGENT.md, SPEC.md des modules) arrivent dans les prochains commits.

## Démarrer en local

```bash
pnpm install
cp .env.example .env.local   # DELIBERA_SESSION_FICTIVE=true pour travailler sans l'API
pnpm dev                     # http://localhost:3000/app
```
