# M9 – Audit : spécifications du client web

> **Sources** : cahier d'analyse v2.3 (CU11, BNF03), cahier de conception (version en ligne de fin novembre 2026 : tableau 8 « Journal d'audit »), `SPEC.md` du module `audit` de `delibera-core-api`.
> Les éléments marqués **[Proposition]** ne figurent pas dans les cahiers : faites-les valider avant de les implémenter.

## 1. Rôle

Consulter, **en lecture seule**, le journal non effaçable de l'école : modifications, connexions, refus d'accès. Aucune entrée ne peut être modifiée ni supprimée : le client n'offre aucune action d'écriture.

## 2. Écrans

| Écran | Route du client | Cas | Accès | Composants du design system |
| --- | --- | --- | --- | --- |
| Journal d'audit | `/audit` | CU11 | `AUDIT_CONSULTER` (administrateur d'école, auditeur) | `DataGrid`, `Timeline`, `DatePicker`, `SearchHighlight`, `Combobox` |

## 3. Comportement attendu

- Filtres : période (du, au), utilisateur, action, entité, identifiant d'objet ; recherche avec mise en évidence (`SearchHighlight`).
- Tableau paginé (50) : date et heure dans le fuseau de l'école (`formaterDateHeure`), auteur, adresse IP, action, objet.
- Détail d'une entrée (`Sheet` ou ligne dépliée) : ancienne et nouvelle valeur ; vue chronologique d'un objet (`Timeline`).
- Export du résultat filtré (CSV ou XLSX) **[Proposition]**.

## 4. Contrat de l'API

| Verbe | Route | Usage |
| --- | --- | --- |
| GET | `/journal-audit?du=&au=&utilisateurId=&action=&entite=&entiteId=` | Journal paginé |
| GET | `/journal-audit/export` | Export **[Proposition]** |

## 5. Tests d'acceptation (interface)

- Sans `AUDIT_CONSULTER`, l'espace n'apparaît pas et `/audit` affiche « Accès non autorisé ».
- Aucun bouton de modification ou de suppression n'existe.
- Les dates s'affichent dans le fuseau de l'école.

## 6. Questions ouvertes

1. Déroulé de CU11 à valider (le cahier d'analyse ne le détaille pas).
2. Catalogue des actions journalisées (codes `CONNEXION_REUSSIE`, `REFUS_ACCES`…) : libellés en français à afficher, à fournir par l'API ou à tenir dans le client ?
