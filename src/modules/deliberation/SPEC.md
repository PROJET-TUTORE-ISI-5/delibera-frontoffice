# M6 et M7 – Délibération et jury : spécifications du client web

> **Sources** : cahier d'analyse v2.3 (CU04 à CU08, CU14, CU17), cahier de conception (version en ligne de fin novembre 2026 : §6.3, tableau 8 « Tableau de bord de la délibération » et « Dossier étudiant et décision », maquettes 1 et 2, algorithmes A6 et A7), `SPEC.md` des modules `deliberation` et `calcul` de `delibera-core-api`, Project Scope (états, T01 à T10).
> Les éléments marqués **[Proposition]** ne figurent pas dans les cahiers : faites-les valider avant de les implémenter.

## 1. Rôle

C'est l'espace central de la plateforme : créer une délibération et lancer la pré-délibération, composer le jury, présenter les propositions et les cas critiques, recueillir les décisions et les relèvements du jury, valider et clôturer, traiter les réclamations. **La plateforme propose, le jury décide.** M6 (calcul) n'a pas d'écran : ses résultats (situations, options de relèvement, UE prioritaires) s'affichent ici.

## 2. Écrans

| Écran | Route du client [Proposition] | Cas | Accès | Composants du design system |
| --- | --- | --- | --- | --- |
| Liste des délibérations | `/deliberations` | CU04 | `DOSSIER_CONSULTER`, `PREDELIB_LANCER`, `JURY_CONSTITUER` ou membre d'un jury | `PageHeader`, `DataGrid`, `Badge` (statut), `Button` |
| Nouvelle délibération | `/deliberations/nouvelle` | CU04 | `PREDELIB_LANCER` | `Combobox` (année, niveau), `Card` (paramètres et règles actifs) |
| Tableau de bord (maquette 1) | `/deliberations/[id]` | CU04, CU05, CU08 | `DOSSIER_CONSULTER` ou jury de cette délibération | `AppShell`, `PageHeader` + `Breadcrumb`, `Filter`, `SelectMenu`, `StatCard` par état, `DataGrid` + `DecisionBadge`, `PageActions`, `ConfirmButton` |
| Dossier étudiant et décision (maquette 2) | `/deliberations/[id]/dossiers/[situationId]` (ou `Sheet` ouvert depuis le tableau de bord) | CU05, CU06 | consulter : `DOSSIER_CONSULTER` ; statuer : `DOSSIER_STATUER` sur cette délibération | `Sheet`, `CreditGauge`, `Collapsible`, `Alert` (options de relèvement), `DecisionRadioGroup`, `MultiSelect`, `Field` + `Textarea` (motif) |
| Composition du jury | `/deliberations/[id]/jury` | CU17 | `JURY_CONSTITUER` | `DataGrid`, `Combobox`, `Dialog` |
| Saisie des rattrapages et réclamations | `/deliberations/[id]/reclamations` | CU14 | `RECLAMATION_TRAITER` ; réouverture : président | `DataGrid`, `Sheet`, `Textarea`, `Timeline` |

## 3. Comportement attendu

### 3.1. Liste et création (CU04)
- Une ligne par délibération : année, niveau, statut (`EN_PREPARATION`, `PRE_DELIBEREE`, `EN_SEANCE`, `CLOTUREE`, `ROUVERTE`), date, qualité de l'utilisateur dans le jury s'il y siège.
- Un membre de jury ne voit que les délibérations de ses jurys (filtrage par l'API).
- Création : année et niveau ; le système affiche **les paramètres et les règles actifs** (versions, seuils limites des conditions dérogeables) et le nombre d'inscrits avant le lancement.
- « Lancer la pré-délibération » : action longue (jusqu'à 30 s pour 500 étudiants, BNF06) avec indicateur de progression ; relance possible (nouvelle version des situations).
- Erreurs : `AUCUN_PARAMETRE_ACTIF` ; dossiers bloqués faute de règle ; dossiers « incomplets ».

### 3.2. Tableau de bord (maquette 1, CU05)
- Fil d'Ariane : école › année › délibération.
- Indicateurs par état (`StatCard` cliquables, qui filtrent le tableau) : ADMIS, ADMIS APRÈS RATTRAPAGE, À DÉLIBÉRER, SOUS CONDITION, AJOURNÉ, BLOQUÉ POUR DETTE.
- Filtres : filière, état, matricule ; tri par écart au seuil.
- Tableau des propositions : matricule, nom, filière, crédits annuels et cumulés, règle appliquée, seuil, seuil limite, écart, proposition, décision du jury s'il y en a une (`DecisionBadge`). Pagination par 50.
- **Le seuil limite s'affiche, il ne se saisit pas** : il appartient à la condition de la règle de passage, figée sur la délibération. La maquette 1 de la copie v1.2 (« seuil limite fixé par le président ») est **dépassée**.
- Décision en lot (BF12) : sélection multiple des propositions `ADMIS` à confirmer **[Proposition : route de décision en lot, question ouverte 3 de l'API]**.
- Actions principales en bas à droite : « Ouvrir la séance » **[Proposition]**, « Valider et clôturer » (président, `ConfirmButton` qui rappelle que la délibération devient non modifiable).

### 3.3. Dossier étudiant et décision (maquette 2, CU05 et CU06)
- Situation : crédits annuels et cumulés, dettes, `CreditGauge` (seuil et seuil limite de la règle), règle appliquée avec la condition en échec.
- EC non validés (`Collapsible`) : note retenue (« 8,50 »), crédits.
- **Options de relèvement** (algorithme A6, calculées par l'API) : EC, note actuelle, note cible, points ajoutés, crédits obtenus ; classées. Aucune option : le dossier est signalé.
- **UE prioritaires** pour le rattrapage (algorithme A7).
- Décision (`DecisionRadioGroup`) : `ADMIS`, `AJOURNE`, `SOUS_CONDITION` ; aucune présélection, jamais `SOUS_CONDITION` par défaut.
  - `SOUS_CONDITION` : sélection obligatoire des **UE exigées** parmi les UE non validées (`MultiSelect`), UE prioritaires proposées en premier.
  - Avec relèvement : choix d'une option, puis recalcul (nouvelle version de la situation) ; l'ancienne version reste consultable.
  - **Motif obligatoire** (astérisque), pour toute décision et tout relèvement.
- Le `verrou` de la situation est renvoyé avec la décision. **409 `MODIFICATION_CONCURRENTE`** : message « Le dossier a été modifié par quelqu'un d'autre », rechargement du dossier, saisie du motif conservée si possible.
- Délibération clôturée : dossier en lecture seule.

### 3.4. Composition du jury (CU17)
- Exactement **un président** et **au moins un membre**, parmi les comptes actifs de l'école. Refus `JURY_INVALIDE`.
- Composition figée après clôture (sauf réouverture).

### 3.5. Validation et clôture (CU08)
- Si des dossiers `A_DELIBERER` restent sans décision : l'API répond `DOSSIERS_EN_ATTENTE` avec la liste ; le client les affiche et permet d'y aller.
- Après clôture : génération du PV et des listes (M8), lien vers les documents.

### 3.6. Réclamations et réouverture (CU14)
- Enregistrement : étudiant, EC ou décision contestée, objet, motif ; délai vérifié par l'API (`RECLAMATION_HORS_DELAI`).
- Réouverture demandée par le gestionnaire, **autorisée par le président** (`REOUVERTURE_AUTORISER`), avec motif ; historique en `Timeline`.

## 4. Contrat de l'API

Routes du `SPEC.md` de l'API (section 10), **[Proposition]** tant qu'elles ne sont pas dans le Swagger :

| Verbe | Route | Usage |
| --- | --- | --- |
| GET, POST | `/deliberations` | Liste, création |
| GET | `/deliberations/{id}` | En-tête, statut, paramètres et règles figés |
| PUT | `/deliberations/{id}/jury` | Composition du jury |
| POST | `/deliberations/{id}/pre-deliberation` | Lancer le calcul (A1) |
| POST | `/deliberations/{id}/seance` | Ouvrir la séance (permission à préciser) |
| GET | `/deliberations/{id}/situations?etat=&filiere=&ecart=` | Tableau de bord (paginé) |
| GET | `/deliberations/{id}/cas-critiques` | Dossiers `A_DELIBERER` |
| GET | `/situations/{id}` | Dossier, versions, options de relèvement, UE prioritaires |
| POST | `/propositions/{id}/decision` | Décision, avec `verrou` |
| POST | `/resultats-ec/{id}/relevement` | Relèvement, avec `verrou` de la situation |
| POST | `/deliberations/{id}/validation` | Valider et clôturer |
| POST | `/deliberations/{id}/publication` | Publier (permission à préciser) |
| GET, POST | `/deliberations/{id}/reclamations` | Réclamations |
| POST | `/reclamations/{id}/cloture` | Clore une réclamation |
| POST | `/deliberations/{id}/reouverture` | Réouverture (président) |

Lectures au chargement : `serveur.ts` ; tableau de bord et dossier (données vivantes en séance) : `hooks/` avec TanStack Query (`staleTime` court, rafraîchissement au retour sur l'onglet), clés `["deliberation", id, …]`, invalidées après chaque décision.

## 5. Erreurs à gérer

| Code | Statut | Affichage |
| --- | --- | --- |
| `MODIFICATION_CONCURRENTE` | 409 | Message, rechargement du dossier |
| `MOTIF_OBLIGATOIRE` | 422 | Erreur sur le champ motif |
| `UE_EXIGEES_INCOHERENTES` | 422 | Erreur sur les UE exigées |
| `DELIBERATION_NON_MODIFIABLE` | 422 | Passage en lecture seule |
| `DOSSIERS_EN_ATTENTE` | 422 | Liste des dossiers à trancher |
| `JURY_INVALIDE` | 422 | Erreur sur la composition |
| `AUCUN_PARAMETRE_ACTIF` | 422 | Message avec lien vers les paramètres (M4) |
| `RECLAMATION_HORS_DELAI` | 422 | Message, réclamation enregistrée close |

## 6. Tests d'acceptation (interface)

Données fictives tirées des scénarios du Project Scope :
- T03 : un dossier à 42 crédits pour un seuil de 45 et un seuil limite de 42 apparaît « À DÉLIBÉRER », avec l'écart de 3 crédits et ses options de relèvement.
- T04 : après un relèvement, le dossier affiche la nouvelle version « ADMIS » et l'ancienne reste consultable.
- T07 : un dossier « BLOQUÉ POUR DETTE » n'offre aucune option de relèvement et affiche la condition non dérogeable.
- Le bouton « Statuer » n'existe que pour un membre du jury de **cette** délibération.
- `SOUS_CONDITION` sans UE exigées ou sans motif : envoi impossible, erreur sur le champ.
- Une réponse 409 recharge le dossier et affiche le message de conflit.
- Une délibération clôturée n'offre plus aucune action de modification.
- « Valider et clôturer » n'apparaît que pour le président et demande une confirmation.

## 7. Questions ouvertes

1. Qui ouvre la séance (`PRE_DELIBEREE` → `EN_SEANCE`), avec quelle permission ? (question 1 de l'API)
2. Qui publie les résultats ? (question 2 de l'API)
3. Décision en lot : critères et route (question 3 de l'API).
4. Plusieurs délibérations pour un même niveau et une même année (par filière) ? (question 5 de l'API) : impact sur la liste et le fil d'Ariane.
5. Dossier étudiant : page dédiée ou panneau latéral (`Sheet`) sur le tableau de bord ? La maquette 2 montre un panneau.
