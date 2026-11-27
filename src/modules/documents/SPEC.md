# M8 – Documents et statistiques : spécifications du client web

> **Sources** : cahier d'analyse v2.3 (CU09, CU10, BF13, BF14), cahier de conception (version en ligne de fin novembre 2026 : tableau 8, « Console » et statistiques), `SPEC.md` du module `documents` de `delibera-core-api`.
> Les éléments marqués **[Proposition]** ne figurent pas dans les cahiers : faites-les valider avant de les implémenter.

## 1. Rôle

Donner accès aux documents produits par l'API (procès-verbaux au modèle de chaque école, listes par décision, relevés de situation) et aux statistiques. Le client **ne génère aucun document** : il les demande à l'API et les télécharge.

## 2. Écrans

| Écran | Route du client [Proposition] | Cas | Accès | Composants du design system |
| --- | --- | --- | --- | --- |
| Documents d'une délibération | onglet de `/deliberations/[id]` (« PV et listes ») | CU09 | `PV_GENERER` (président : sa délibération) ou `DOSSIER_CONSULTER` (lecture) | `DataGrid`, `Button`, `ConfirmButton` (signature) |
| Relevé de situation | bouton du dossier étudiant (M7) | CU09 | `DOSSIER_CONSULTER` | `Button` |
| Statistiques | `/statistiques` | CU10 | `STATS_CONSULTER` | `StatCard`, `Chart`, `DataGrid`, `SelectMenu` (année, niveau, filière) |

## 3. Comportement attendu

- **PV** : liste des PV d'une délibération (numéro, date, signé ou non, signataire) ; l'ancien PV reste visible après une réouverture. Téléchargement par un lien (`api.url("/proces-verbaux/{id}/fichier")`). « Enregistrer la signature » : président de la délibération, après signature sur place, avec confirmation.
- **Listes** par décision (`ADMIS`, `ADMIS_APRES_RATTRAPAGE`, `SOUS_CONDITION`, `AJOURNE`, `BLOQUE_POUR_DETTE`), en PDF et XLSX, dès la clôture.
- **Statistiques** : taux d'admission et répartition des résultats retenus par niveau, filière et année, avec filtres ; export XLSX. Sur une délibération en cours, la mention **« provisoire »** est affichée.
- Graphiques : composant `Chart` du design system, couleurs des états identiques à `DecisionBadge` ; chaque graphique a aussi sa lecture en tableau (accessibilité).

## 4. Contrat de l'API

| Verbe | Route | Usage |
| --- | --- | --- |
| POST, GET | `/deliberations/{id}/proces-verbaux` | Générer, lister |
| GET | `/proces-verbaux/{id}/fichier` | PDF |
| POST | `/proces-verbaux/{id}/signature` | Signature (président) |
| GET | `/deliberations/{id}/listes?etat=&format=pdf\|xlsx` | Listes |
| GET | `/situations/{id}/releve` | Relevé PDF |
| GET | `/statistiques?anneeId=&niveauId=&filiereId=` | Statistiques |
| GET | `/statistiques/export` | Export XLSX |

Toutes **[Proposition]** tant qu'elles ne sont pas dans le Swagger. Les fichiers passent par le relais en flux, avec `content-disposition`.

## 5. Tests d'acceptation (interface)

- Les liens de téléchargement pointent vers `/app/api/v1/…` (relais), jamais vers `/api/v1` directement.
- « Enregistrer la signature » n'apparaît que pour le président de cette délibération.
- Les statistiques d'une délibération en cours portent la mention « provisoire ».

## 6. Questions ouvertes

1. Déroulés de CU09 et CU10 à valider (le cahier d'analyse ne les détaille pas).
2. Modèles officiels de PV de SJI et de SJM, pour l'aperçu attendu.
