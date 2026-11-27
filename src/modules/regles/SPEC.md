# M4 – Règles et paramètres : spécifications du client web

> **Sources** : cahier d'analyse v2.3 (CU02, CU13), cahier de conception (version en ligne de fin novembre 2026 : tableau 8 « Éditeur de règle de passage » et « Paramètres de délibération », maquette 4, algorithme A2), `SPEC.md` du module `regles` de `delibera-core-api`, Project Scope (§6, §11).
> Les éléments marqués **[Proposition]** ne figurent pas dans les cahiers : faites-les valider avant de les implémenter.

## 1. Rôle

Saisir sans code les **règles de passage** (qui passe) et les **jeux de paramètres de délibération** (comment on calcule). Aucune valeur n'est écrite dans le client (BNF02) : le client édite des données, l'API les vérifie et les versionne.

## 2. Écrans

| Écran | Route du client [Proposition] | Cas | Accès | Composants du design system |
| --- | --- | --- | --- | --- |
| Règles de passage | `/regles` | CU02 | `REGLE_GERER` (lecture aussi avec `DOSSIER_CONSULTER`) | `DataGrid`, `Badge` (version, active) |
| Éditeur de règle (maquette 4) | `/regles/nouvelle`, `/regles/[code]` | CU02 | `REGLE_GERER` | `Combobox` (portée), `ToggleGroup` (ET / OU), `Select` (variable, opérateur), `Switch` (dérogeable), `Button` `dashed` (ajouter une condition), `Card` (lecture en clair), `Badge` (version) |
| Paramètres de délibération | `/parametres` | CU13 | `PARAM_GERER` | `SettingsPanel`, `Switch`, `Slider`, `DatePicker`, `Select` |

## 3. Comportement attendu

### 3.1. Éditeur de règle (maquette 4, CU02)
- **Portée** : niveau de départ (obligatoire), filière ou spécialité (facultatives) ; le niveau d'arrivée est affiché (niveau suivant du référentiel), non saisi. Date d'effet.
- **Conditions** (au moins une), chacune sur une ligne : variable (`CREDITS_ANNUELS`, `CREDITS_CUMULES`, `DETTE_NIVEAU`, `UE_VALIDEE`, `MOYENNE_ANNUELLE`), opérateur (`≥`, `>`, `≤`, `<`, `=`, `≠`), valeur ; niveau visé pour `DETTE_NIVEAU`, UE visée pour `UE_VALIDEE` ; ordre ; **dérogeable** ; pour une condition dérogeable, son **seuil limite** (fourni par le président du jury).
- **Combinaison** ET ou OU (pas de parenthèses).
- **Lecture en clair** mise à jour en direct, par exemple : « De Ing 1 vers Ing 2 : crédits annuels ≥ 45 (dérogeable jusqu'à 42) ». Le texte est construit à partir des données saisies, sans aucune valeur par défaut.
- Contrôles locaux (confort) : seuil limite seulement si dérogeable ; seuil limite qui n'atteint pas la valeur ; champ manquant signalé. L'API refait tous les contrôles.
- Enregistrer une règle active existante crée une **nouvelle version** : le client l'annonce avant l'enregistrement ; l'historique des versions reste consultable.

### 3.2. Paramètres (CU13)
- Portée : école entière, un cycle ou un niveau ; année.
- Champs : crédits de l'année, note de validation, note éliminatoire (sur 20, `< note de validation`), capitalisation des EC, mode de rattrapage, mode de moyenne, combinaison des CC, traitement des absences, délai de réclamation (jours), profondeur d'historique (années).
- Le jeu applicable à un étudiant est le plus précis (niveau, puis cycle, puis école) : l'écran indique lequel s'applique.
- Jeu déjà utilisé par une délibération clôturée : nouvelle version (annoncée).

## 4. Contrat de l'API

| Verbe | Route | Usage |
| --- | --- | --- |
| GET, POST | `/regles-passage` | Liste, création |
| GET | `/regles-passage/{code}/versions` | Historique |
| POST | `/regles-passage/{id}/activation`, `/nouvelle-version` | Activer, versionner |
| GET, POST | `/parametres-deliberation` | Liste, création |
| POST | `/parametres-deliberation/{id}/activation` | Activer |
| GET | `/parametres-deliberation/applicable?anneeId=&niveauId=` | Jeu applicable |

Listes de choix (niveaux, filières, spécialités, UE) : routes du référentiel (M3). Toutes **[Proposition]** tant qu'elles ne sont pas dans le Swagger.

## 5. Erreurs à gérer

Erreurs de validation (400) affichées sur le champ concerné (`erreursParChamp`) ; incohérences métier (422 : seuil limite invalide, note éliminatoire trop haute, portée déjà couverte) affichées avec le `detail` de l'API.

## 6. Tests d'acceptation (interface)

- Le champ « seuil limite » n'apparaît que pour une condition dérogeable.
- `DETTE_NIVEAU` exige un niveau, `UE_VALIDEE` une UE.
- La lecture en clair reflète la saisie, ET ou OU compris.
- Modifier une règle active annonce la création d'une version 2.
- Aucun nombre (45, 120, 10, 7…) n'est prérempli dans les formulaires.

## 7. Questions ouvertes

1. Valeurs de `modeMoyenne`, `combinaisonCC` et `traitementAbsence` retenues par SJI et SJM (question 1 de l'API) : libellés à afficher.
2. Une condition `MOYENNE_ANNUELLE` peut-elle être dérogeable ? (question 4 de l'API)
