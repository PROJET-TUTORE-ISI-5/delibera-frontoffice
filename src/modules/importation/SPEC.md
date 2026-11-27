# M5 – Import : spécifications du client web

> **Sources** : cahier d'analyse v2.3 (CU03, CU07), cahier de conception (version en ligne de fin novembre 2026 : §2.2 « Fichiers d'import », tableau 8 « Import des données », maquette 3), `SPEC.md` du module `importation` de `delibera-core-api`.
> Les éléments marqués **[Proposition]** ne figurent pas dans les cahiers : faites-les valider avant de les implémenter.

## 1. Rôle

Seule porte d'entrée des données (BNF11) : le gestionnaire téléverse des fichiers Excel (`.xlsx`) ou CSV (UTF-8), vérifie la correspondance des colonnes et les anomalies **avant tout enregistrement**, puis valide. Une note n'est jamais écrasée.

## 2. Écrans

| Écran | Route du client [Proposition] | Cas | Accès | Composants du design system |
| --- | --- | --- | --- | --- |
| Import en quatre étapes (maquette 3) | `/import` | CU03 | `DONNEES_IMPORTER` | `Stepper`, `FileField`, `DataGrid`, `Checkbox`, `Alert`, `Select` |
| Notes de rattrapage | `/import?type=NOTES_RATTRAPAGE` | CU07 | `RATTRAPAGE_SAISIR` | Idem |
| Historique des imports | `/import/historique` | CU03 | `DONNEES_IMPORTER` ou `RATTRAPAGE_SAISIR` | `DataGrid`, `Badge` |

## 3. Comportement attendu

Les quatre étapes (maquette 3) :

1. **Type et année** : type de données (`ETUDIANTS_INSCRIPTIONS`, `MAQUETTE`, `INSCRIPTIONS_PEDAGOGIQUES`, `NOTES`, `NOTES_RATTRAPAGE`, `ACQUIS`), année académique **ouverte** (et niveau et session pour le rattrapage). Lien « Télécharger le modèle ».
2. **Fichier** : `FileField` (glisser-déposer), `.xlsx` ou `.csv`, 10 Mo au plus (contrôle local avant l'envoi). Envoi par `api.televerser("/imports", formulaire)` : l'API renvoie l'**aperçu**.
3. **Correspondance et contrôle** : correspondance proposée entre les colonnes du fichier et le modèle (modifiable) ; `DataGrid` des lignes valides et des anomalies, avec le motif de chaque anomalie ; `Checkbox` pour exclure une ligne. Même fichier déjà importé (empreinte SHA-256) : `Alert` d'avertissement.
4. **Validation et rapport** : nombre de lignes importées, exclues et en anomalie ; lien vers l'historique.

Règles :
- Rien n'est enregistré avant l'étape 4 : le texte de l'interface le dit.
- Rattrapage (CU07) : une note RAT sur un EC déjà validé est **signalée** ; le gestionnaire la confirme ou l'exclut. Délibération en séance ou clôturée : import refusé (message de l'API).
- Données affichées dans les aperçus : fictives en démonstration ; jamais d'export de ces aperçus vers le navigateur (pas de stockage local).

## 4. Contrat de l'API

| Verbe | Route | Usage |
| --- | --- | --- |
| GET | `/imports/modeles/{type}` | Télécharger le modèle (lien `api.url`) |
| POST | `/imports` (multipart : `fichier`, `type`, `anneeId`) | Aperçu |
| POST | `/imports/{id}/validation` (correspondance, lignes exclues) | Rapport |
| GET | `/imports`, `/imports/{id}` | Historique, détail |
| GET | `/etudiants`, `/etudiants/{id}`, `/inscriptions-annuelles?anneeId=&niveauId=` | Consultation (`DOSSIER_CONSULTER`) |

Toutes **[Proposition]** tant qu'elles ne sont pas dans le Swagger. Le relais transmet le fichier en flux ; Nginx accepte 12 Mo.

## 5. Erreurs à gérer

| Cas | Affichage |
| --- | --- |
| Format non reconnu | Message et lien vers le modèle |
| Année non ouverte | Message avec lien vers le référentiel (M3) |
| Fichier trop gros (local ou 413) | « 10 Mo au plus » |
| Import refusé (délibération en séance ou clôturée) | `detail` de l'API ; rappel : passer par une réclamation (CU14) |
| 502 pendant l'envoi | Réessayer ; rien n'a été enregistré |

## 6. Tests d'acceptation (interface)

- Un fichier de plus de 10 Mo est refusé avant l'envoi.
- L'aperçu montre séparément lignes valides et anomalies ; exclure une ligne la retire du compte à importer.
- Rien n'est importé tant que l'étape 4 n'est pas validée.
- Le second import du même fichier affiche l'avertissement.
- Un utilisateur sans `RATTRAPAGE_SAISIR` ne peut pas choisir `NOTES_RATTRAPAGE`.

## 7. Questions ouvertes

1. Colonnes exactes des modèles (exports anonymisés des tables de SJI, question 1 de l'API).
2. Durée de conservation du fichier entre l'aperçu et la validation (question 2 de l'API) : un aperçu peut-il expirer pendant que l'utilisateur corrige ?
3. Saisie manuelle de notes (`OrigineNote.SAISIE`) : quel écran ? (question 4 de l'API)
