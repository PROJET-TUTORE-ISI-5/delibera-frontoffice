# M3 – Référentiel et maquettes : spécifications du client web

> **Sources** : cahier d'analyse v2.3 (CU01, BF01 à BF03, contraintes §4.2.7), cahier de conception (version en ligne de fin novembre 2026 : §6.1.2), `SPEC.md` du module `referentiel` de `delibera-core-api`.
> Les éléments marqués **[Proposition]** ne figurent pas dans les cahiers : faites-les valider avant de les implémenter.

## 1. Rôle

Permettre à l'administrateur d'école de décrire l'organisation académique **de son école** : années, semestres et sessions ; cycles, niveaux et chaîne des niveaux suivants ; filières et niveaux qu'elles couvrent ; spécialités ; classes ; catalogue des UE et des EC ; maquette de chaque année. Le référentiel alimente aussi les listes de choix des autres espaces (filtres, portées des règles, périmètres des rôles).

Le cahier d'analyse ne détaille pas CU01 : les écrans ci-dessous sont une **[Proposition]**, déduite de BF01 à BF03 et du modèle.

## 2. Écrans

| Écran | Route du client [Proposition] | Accès | Composants du design system |
| --- | --- | --- | --- |
| Référentiel (onglets) | `/referentiel` | `REFERENTIEL_GERER` | `Tabs`, `DataGrid`, `Dialog`, `Combobox`, `Field`, `ConfirmButton` |
| Années académiques | onglet « Années » | Idem | `DataGrid`, `Badge` (statut), `DatePicker` |
| Cycles, niveaux, filières, spécialités | onglet « Structure » | Idem | `Tree` ou `DataGrid`, `MultiSelect` (niveaux couverts) |
| Classes | onglet « Classes » | Idem | `DataGrid` |
| UE et EC | onglet « Catalogue » | Idem | `DataGrid` |
| Maquette de l'année | onglet « Maquette » ou `/referentiel/maquettes/[anneeId]` | Idem | `DataGrid`, `Sheet` (enseignements et types d'évaluation) |

## 3. Comportement attendu

- **Années** : création (code `2026-2027`, dates), puis transitions `EN_PREPARATION` → `OUVERTE` → `CLOTUREE` → `ARCHIVEE` par des actions explicites (`ConfirmButton` pour clôturer et archiver). Les imports (M5) exigent une année ouverte : le rappeler.
- **Structure** : une filière ne couvre que des niveaux de son cycle (exemple de SJI : Tronc commun couvre Ing 1 et Ing 2 ; ISI, SRT, GC et GELEC couvrent Ing 3 à Ing 5). Le choix des niveaux couverts se limite aux niveaux du cycle. Niveau : numéro, libellé, diplômant (indépendant du niveau suivant), niveau suivant (éventuellement dans un autre cycle, L3 → M1).
- **Maquette** : pour chaque UE ouverte, niveau, semestre, filières (et spécialités), caractère obligatoire ; ses enseignements (EC, crédits) ; pour chaque enseignement, ses types d'évaluation (`CC`, `TP`, `SN`, `RAT`) et leurs pourcentages. Les crédits d'une UE sont **affichés tels que l'API les calcule** (somme des enseignements), jamais recalculés par le client. Les pourcentages hors RAT doivent faire 100 : le client le signale, l'API le vérifie.
- Une maquette est propre à une année : modifier l'année courante ne touche pas les années passées.

## 4. Contrat de l'API

| Verbe | Route | Usage |
| --- | --- | --- |
| GET, POST | `/annees-academiques` | Années |
| POST | `/annees-academiques/{id}/ouverture`, `/cloture`, `/archivage` | Transitions |
| GET, POST | `/annees-academiques/{id}/semestres`, `/sessions-evaluation` | Semestres, sessions |
| GET, POST, PUT | `/cycles`, `/niveaux`, `/filieres`, `/specialites`, `/classes`, `/ues`, `/ecs` | Structure et catalogue |
| PUT | `/filieres/{id}/niveaux` | Niveaux couverts |
| GET, POST, PUT, DELETE | `/maquettes` | Maquette (suppression refusée s'il existe des inscriptions) |

Lecture : tout utilisateur de l'école **[Proposition]** (listes de choix des autres espaces) ; écriture : `REFERENTIEL_GERER`. Toutes **[Proposition]** tant qu'elles ne sont pas dans le Swagger.

## 5. Erreurs à gérer

Codes déjà utilisés dans l'école (409), contraintes du modèle (422 : filière qui ne couvre pas le niveau, pourcentages, EC en double dans une UE, boucle de niveaux suivants) affichées avec le `detail` de l'API, sur le champ quand c'est possible.

## 6. Tests d'acceptation (interface)

- Le choix des niveaux couverts par une filière ne propose que les niveaux de son cycle.
- Une maquette d'Ing 1 ne propose pas la filière ISI.
- Les crédits d'une UE affichés sont ceux renvoyés par l'API.
- Clôturer une année demande une confirmation.

## 7. Questions ouvertes

1. Déroulé de CU01 à valider (question 1 de l'API), donc l'organisation des onglets.
2. Un niveau peut-il mener à deux niveaux différents (question 2 de l'API) ?
