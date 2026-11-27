# M1 – Sécurité et accès : spécifications du client web

> **Sources** : cahier d'analyse v2.3 (CU00, CU12, CU16, CU18, §3.5), cahier de conception (version en ligne de fin novembre 2026 : §2.2, §6.1.7, §6.3, tableau 8 « Connexion et double authentification », « Comptes, rôles et composition du jury »), `SPEC.md` du module `securite` de `delibera-core-api`.
> Les éléments marqués **[Proposition]** ne figurent pas dans les cahiers : faites-les valider avant de les implémenter.

## 1. Rôle

Connecter les utilisateurs et tenir leur session (côté client : cookies, renouvellement, déconnexion), adapter l'interface à leurs permissions, et offrir à l'administrateur d'école la gestion des comptes et des rôles.

**État** : authentification complète côté client (itération 0) ; écrans « Utilisateurs » et « Rôles et permissions » à construire (itération 1).

## 2. Écrans

| Écran | Route du client | Cas | Accès | Composants du design system |
| --- | --- | --- | --- | --- |
| Connexion | `/connexion` | CU00 | public | `LinearBackground`, `BrandLogo`, `Card`, `InputField`, `Button`, `Alert` |
| Code de vérification | `/connexion/code` | CU00 (double authentification) | public, après connexion | `InputOTP` |
| Mot de passe oublié | `/mot-de-passe-oublie` | CU18 | public | `InputField` |
| Nouveau mot de passe | `/reinitialisation?jeton=…` | CU18 | public (lien de 30 min) | `InputField` |
| Activation du compte | `/activation?jeton=…` | CU12 | public (lien de 72 h) | `InputField` |
| Changement imposé | `/mon-compte/mot-de-passe` | CU00 (première connexion) | connecté | `InputField` |
| Utilisateurs | `/utilisateurs` | CU12 | `UTILISATEUR_GERER` | `DataGrid`, `Combobox`, `Dialog`, `DropdownMenu`, `DatePicker` |
| Rôles et permissions | `/roles` | CU16 | `ROLE_GERER` | `DataGrid`, `CheckboxTree`, `Dialog` |
| Menu utilisateur | barre supérieure | CU00 (déconnexion) | connecté | `NavUser` |

## 3. Comportement attendu

### 3.1. Connexion (en place)
- Message d'échec **neutre** : « Adresse e-mail ou mot de passe incorrect, ou compte indisponible. » Jamais de distinction entre compte inconnu, mot de passe faux, compte verrouillé ou école suspendue.
- L'e-mail saisi est conservé après un échec ; le mot de passe ne l'est jamais.
- `?suite=` ramène à la page demandée après connexion (`suiteSure`).
- Double authentification : `jetonIntermediaire` gardé 5 min dans le cookie `delibera_code`, puis `/connexion/code`.
- `doitChangerMotDePasse` : redirection vers `/mon-compte/mot-de-passe` ; la coquille de l'espace y renvoie tant que ce n'est pas fait.

### 3.2. Mot de passe oublié, réinitialisation, activation (en place)
- La demande de lien répond toujours la même chose, que l'adresse existe ou non.
- 10 caractères au minimum, confirmation identique (`schemas.ts`) ; l'API reste juge (BNF05).
- Lien expiré ou déjà utilisé : message qui invite à demander un nouveau lien.

### 3.3. Utilisateurs (CU12, à construire)
- Tableau des comptes **de l'école** : nom, prénom, e-mail, rôles avec périmètre et période, statut (actif, en attente d'activation, verrouillé, désactivé), dernière connexion. Filtres par rôle, statut et périmètre ; recherche par nom ou e-mail.
- Création : nom, prénom, e-mail, puis un ou plusieurs rôles, chacun avec un type de périmètre (`ECOLE`, `CYCLE`, `NIVEAU`), le périmètre visé (liste issue du référentiel M3) et une période (date de début, date de fin facultative). Message de confirmation : un lien d'activation valable 72 h est envoyé.
- Actions par compte (menu) : modifier, affecter ou retirer un rôle, désactiver ou réactiver (avec `ConfirmButton` qui rappelle que les sessions sont révoquées immédiatement), renvoyer le lien d'activation **[Proposition]**.
- Le maquettage Figma « Utilisateurs – comptes » (équipe Delibera Plateform) sert de référence visuelle.

### 3.4. Rôles et permissions (CU16, à construire)
- Matrice rôles × permissions (`CheckboxTree` groupé par module M1 à M10).
- Rôles prédéfinis en lecture seule, avec l'action « Dupliquer ». Rôles personnalisés : code, libellé, permissions cochées.
- `ECOLE_GERER` n'est jamais proposée. Un rôle encore attribué ne peut pas être supprimé (message de l'API).

## 4. Contrat de l'API

Routes du `SPEC.md` de l'API (section 9), toutes **[Proposition]** tant qu'elles ne sont pas dans le Swagger. Le client attend les formes suivantes (`types.ts`) :

| Verbe | Route | Appelée par | Corps | Réponse attendue |
| --- | --- | --- | --- | --- |
| POST | `/auth/connexion` | `actions.ts` | `{ email, motDePasse }` | `ResultatConnexion { doubleAuthentificationRequise, doitChangerMotDePasse, jetons?, jetonIntermediaire? }` |
| POST | `/auth/code` | `actions.ts` | `{ jetonIntermediaire, code }` | `JetonsSession` |
| POST | `/auth/renouvellement` | `proxy.ts`, relais | `{ jetonRenouvellement }` | `JetonsSession { jetonAcces, jetonRenouvellement, expireDans }` (secondes) |
| POST | `/auth/deconnexion` | `actions.ts` | — (jeton) | 204 |
| POST | `/auth/mot-de-passe-oublie` | `actions.ts` | `{ email }` | 202 ou 204, toujours |
| POST | `/auth/reinitialisation` | `actions.ts` | `{ jeton, nouveauMotDePasse }` | 204 |
| POST | `/auth/activation` | `actions.ts` | `{ jeton, motDePasse }` | 204 |
| PUT | `/moi/mot-de-passe` | `actions.ts` | `{ ancienMotDePasse, nouveauMotDePasse }` | 204 |
| GET | `/moi` | `serveur.ts` (`lireMoi`) | — | `Moi { id, nom, prenom, email, ecole?, permissions[], affectations[], jurys[{ deliberationId, qualite }], doitChangerMotDePasse }` |
| GET, POST, PATCH | `/utilisateurs`, `/utilisateurs/{id}` | CU12 | | |
| POST | `/utilisateurs/{id}/desactivation`, `/reactivation` | CU12 | | |
| POST, DELETE | `/utilisateurs/{id}/affectations[/{affectationId}]` | CU12 | | |
| GET, POST, PUT, DELETE | `/roles`, `/roles/{id}`, `/roles/{id}/duplication` | CU16 | | |
| GET | `/permissions` | CU16 | | |

**Besoins envers l'API** (à transmettre à l'équipe backend) :
1. Le **`jetonIntermediaire`** de la double authentification : le `SPEC.md` de l'API prévoit `verifierCode(utilisateurId, code)`. Le client ne doit pas envoyer un identifiant d'utilisateur choisi par le navigateur : il demande un jeton court, signé, remis à la connexion. **[Proposition]**
2. **`expireDans`** (secondes) dans `JetonsSession`, pour faire expirer le cookie avant le jeton.
3. **`/moi`** doit renvoyer les **jurys** (délibération et qualité) en plus des permissions des rôles, et `doitChangerMotDePasse`.
4. Un libellé de rôle lisible dans `affectations` (affiché sous le nom de l'utilisateur).

## 5. Erreurs à gérer

| Code ou statut | Où | Affichage |
| --- | --- | --- |
| 400, 401, 403, 404, 422, 423 sur `/auth/connexion` | Connexion | Message neutre (section 3.1) |
| 502 `API_INJOIGNABLE` | Partout | « Le serveur de la plateforme est injoignable. Réessayez dans un instant. » |
| `EMAIL_DEJA_UTILISE` | Création d'un compte | Erreur sur le champ e-mail |
| Rôle attribué, code déjà utilisé | Rôles | `detail` de l'API |
| 401 ailleurs | Toute page | Retour à `/connexion?suite=…` (automatique) |

## 6. Tests d'acceptation (interface)

- Sans session, toute page de l'espace renvoie vers `/connexion?suite=<page>` ; après connexion, l'utilisateur arrive sur cette page. *(en place, vérifié)*
- Un échec de connexion affiche le message neutre et conserve l'e-mail. *(en place)*
- Un jeton d'accès expiré avec un jeton de renouvellement valide : la page s'affiche sans repasser par la connexion, avec de nouveaux cookies. *(en place, vérifié)*
- Un jeton de renouvellement refusé : cookies effacés, retour à la connexion. *(en place, vérifié)*
- Le relais refuse `/v1/auth/**`, une modification venue d'un autre site et un chemin hors `v1`. *(en place, tests `route.test.ts`)*
- Le menu d'un gestionnaire ne montre ni « Utilisateurs », ni « Journal d'audit », ni « Écoles clientes » ; celui d'un membre de jury sans rôle montre « Délibérations ». *(en place, tests `navigation.test.ts`)*
- `/utilisateurs` sans `UTILISATEUR_GERER` affiche « Accès non autorisé ».
- La création d'un compte avec un e-mail déjà utilisé affiche l'erreur sur le champ.
- La désactivation d'un compte demande une confirmation qui rappelle la révocation des sessions.
- `ECOLE_GERER` n'apparaît pas dans la matrice d'une école ; un rôle prédéfini n'est pas modifiable.

## 7. Questions ouvertes

1. Contrat de la double authentification (`jetonIntermediaire`, section 4) : à valider avec l'équipe backend.
2. Enrôlement TOTP (QR code) : quel écran, et quand (première connexion si l'école l'exige) ?
3. Durée de vie du jeton de renouvellement (question ouverte de l'API) : le cookie dure 8 h par défaut (`DELIBERA_DUREE_RENOUVELLEMENT`).
4. Écran « Mon profil » (menu utilisateur) : prévu par le design system (`NavUser`), absent des cahiers.
