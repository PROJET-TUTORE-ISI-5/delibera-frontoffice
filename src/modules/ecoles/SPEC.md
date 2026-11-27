# M2 – Écoles clientes : spécifications du client web

> **Sources** : cahier d'analyse v2.3 (CU15, BF19), cahier de conception (version en ligne de fin novembre 2026 : §2.3 « Service partagé », tableau 8 « Console de la plateforme »), `SPEC.md` du module `ecole` de `delibera-core-api`.
> Les éléments marqués **[Proposition]** ne figurent pas dans les cahiers : faites-les valider avant de les implémenter.

## 1. Rôle

Console de l'**administrateur de la plateforme** (compte sans école) : créer les écoles clientes et leur premier administrateur, les suspendre et les réactiver. Cet administrateur n'accède à **aucune donnée académique** (BNF13) : son menu ne montre que cet espace.

Le module fournit aussi, pour tout utilisateur d'une école, le nom de son école dans la barre supérieure (`ecole` de `/api/v1/moi`).

## 2. Écrans

| Écran | Route du client | Cas | Accès | Composants du design system |
| --- | --- | --- | --- | --- |
| Console de la plateforme | `/plateforme/ecoles` | CU15 | `ECOLE_GERER` | `Tabs`, `StatCard`, `Chart`, `DataGrid` |
| Nouvelle école | `Dialog` depuis la console | CU15 | `ECOLE_GERER` | `Dialog`, `Field`, `Switch`, `Select` (fuseau) |
| Fiche d'une école | `/plateforme/ecoles/[id]` [Proposition] | CU15 | `ECOLE_GERER` | `Card`, `ConfirmButton` |

## 3. Comportement attendu

- Indicateurs : écoles actives et suspendues **[Proposition]** ; aucune statistique académique.
- Tableau : code, nom, statut (`ACTIVE`, `SUSPENDUE`), date d'adhésion, double authentification exigée, fuseau horaire.
- Création : code (unique sur la plateforme, `SJI`, `SJM`), nom, fuseau (IANA, `Africa/Douala` proposé **[Proposition]**), double authentification ; puis nom, prénom et e-mail du premier administrateur. Confirmation : un lien d'activation lui est envoyé.
- Suspension : `ConfirmButton` qui rappelle la conséquence (ses utilisateurs ne peuvent plus se connecter ; leurs sessions sont révoquées **[Proposition]** ; ses données sont conservées), motif obligatoire. Réactivation : confirmation simple.

## 4. Contrat de l'API

| Verbe | Route | Usage |
| --- | --- | --- |
| GET, POST | `/ecoles` | Liste, création (avec le premier administrateur) |
| GET, PATCH | `/ecoles/{id}` | Fiche, modification |
| POST | `/ecoles/{id}/suspension`, `/reactivation` | Statut |
| GET | `/ecoles/courante` | École de l'utilisateur (le client utilise plutôt `ecole` de `/moi`) |

Toutes **[Proposition]** tant qu'elles ne sont pas dans le Swagger.

## 5. Erreurs à gérer

`CODE_ECOLE_DEJA_UTILISE` (409) sur le champ code ; `EMAIL_DEJA_UTILISE` sur l'e-mail du premier administrateur.

## 6. Tests d'acceptation (interface)

- Un administrateur d'école ne voit pas l'espace « Écoles clientes » et reçoit « Accès non autorisé » sur `/plateforme/ecoles`.
- L'administrateur de la plateforme ne voit que « Tableau de bord » et « Écoles clientes » dans son menu.
- La suspension exige une confirmation et un motif.

## 7. Questions ouvertes

1. Révocation immédiate des sessions à la suspension (question 1 de l'API).
2. Fuseau par défaut de SJI et SJM (question 2 de l'API).
3. Suppression définitive d'une école (question 3 de l'API) : aucun bouton tant que ce n'est pas tranché.
