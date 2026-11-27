# AGENT.md – Règles pour les agents qui participent au développement

Ce fichier s'adresse à tout agent (assistant IA de code, agent autonome) qui modifie `delibera-frontoffice`, le client web de Delibera. Il vaut aussi pour les membres de l'équipe. **Lisez-le en entier avant toute modification**, puis relisez la section 12 au début de chaque nouvelle fonctionnalité.

En cas de conflit, l'ordre de priorité est le suivant :
1. une consigne explicite d'un membre de l'équipe dans la conversation en cours ;
2. ce fichier ;
3. le `SPEC.md` du module concerné (`src/modules/<module>/SPEC.md`) ;
4. le `SPEC.md` du module correspondant dans `delibera-core-api`, puis le cahier de conception, puis le cahier d'analyse (section 1) ;
5. vos habitudes ou vos préférences.

Le fichier `AGENTS.md`, à côté de celui-ci, est écrit par Next.js : il rappelle que cette version de Next.js diffère de ce que vous connaissez. Prenez-le au sérieux (section 15).

---

## 1. Sources de vérité

| Document | Où | Ce qu'il fixe |
| --- | --- | --- |
| `SPEC.md` de chaque module du client | `src/modules/<module>/SPEC.md` | Écrans, routes du client, permissions, composants du design system, appels à l'API, états et erreurs à gérer, tests d'acceptation, questions ouvertes |
| `SPEC.md` des modules de l'API | dépôt `delibera-core-api`, `src/main/java/com/delibera/<module>/SPEC.md` | Cas d'utilisation détaillés, modèle, règles métier, **routes de l'API et codes d'erreur** |
| Contrat de l'API (Swagger) | `http://<EC2_HOST>/swagger-ui.html`, ou `http://localhost:8080/swagger-ui.html` | Forme exacte des requêtes et des réponses, une fois la route codée dans l'API. **Il prime sur les `[Proposition]` des SPEC.md.** |
| Cahier de conception | Version en ligne la plus récente (fin novembre 2026) | Modules M1 à M10 (tableau 5), charte graphique (§6.3), composants par écran (tableau 8), maquettes (§6.4) |
| Cahier d'analyse | v2.3 | Cas d'utilisation CU00 à CU18, acteurs, matrice des permissions (§3.5) |
| Design system Délibéra UI | `http://15.188.107.127/docs`, dépôt `delibera-ui` | Les 80 composants, les jetons de couleur, les deux maquettes reconstruites |
| Maquettes Figma | Équipe Figma « Delibera Plateform » | Écrans détaillés, quand ils existent |
| Project Scope (Saint Jean) | V2 | Six états de décision, scénarios T01 à T10 |

Attention : la copie « v1.2 » du cahier de conception (8 novembre) est **dépassée**. Elle fait encore fixer une « marge » ou un « seuil limite » par le président en séance (maquette 1, tableau 8 : « Input et Button pour le seuil limite »). Dans la version en vigueur, **le seuil limite appartient à chaque condition dérogeable de la règle de passage** : il se saisit dans l'éditeur de règle (M4) et ne se modifie jamais en séance. Les `SPEC.md` suivent la version en vigueur.

Règles :
- **Commencez toujours par le `SPEC.md` du module.** Il cite ses sources ; remontez-y en cas de doute.
- Les éléments marqués **[Proposition]** ne viennent pas des cahiers. Faites-les valider par l'équipe **avant** de les implémenter.
- **N'inventez jamais une règle métier, un libellé d'état ou une route d'API.** Si un document ne tranche pas, ou si deux documents se contredisent, arrêtez-vous et posez la question. Notez-la dans la section « Questions ouvertes » du `SPEC.md` du module.
- Tout écart volontaire par rapport au cahier de conception est consigné dans `docs/decisions/` (section 10.3).

## 2. Règles métier à ne jamais enfreindre

- **Plateforme SaaS, écoles isolées** (BNF12) : chaque école (SJI, SJM ou autre) est un client autonome. Le client web **n'envoie jamais d'identifiant d'école** à l'API : l'école vient de la session, côté serveur. N'ajoutez ni paramètre `ecoleId`, ni sélecteur d'école dans l'espace d'une école.
- **Le client affiche, l'API décide.** Aucun calcul de note, de crédit, de dette, de proposition ou de seuil dans le client (BNF02). Le client affiche les valeurs renvoyées par l'API, déjà arrondies. Les nombres 45, 42, 10 ou 7 n'apparaissent que dans les tests et les données fictives.
- **La plateforme propose, le jury décide.** L'état `SOUS_CONDITION` n'est jamais présélectionné. Une décision ou un relèvement exige un **motif**, champ obligatoire marqué d'un astérisque. `SOUS_CONDITION` exige les **UE exigées** ; les autres états les interdisent.
- **Six états de décision**, et seulement six : `ADMIS`, `ADMIS_APRES_RATTRAPAGE`, `SOUS_CONDITION`, `A_DELIBERER`, `AJOURNE`, `BLOQUE_POUR_DETTE`. Affichez-les avec `DecisionBadge` (couleur et libellé du design system), jamais avec un texte ou une couleur à vous.
- **Concurrence en séance** : les objets modifiables en séance (`Deliberation`, `SituationAcademique`, `DecisionJury`) portent un `verrou`. Le client le renvoie à chaque modification. Une erreur **409** (`MODIFICATION_CONCURRENTE`) se traite toujours : message clair, rechargement du dossier, aucune perte silencieuse.
- **Délibération clôturée = lecture seule.** Masquez ou désactivez toute action de modification, mais comptez sur l'API pour refuser (`DELIBERATION_NON_MODIFIABLE`).
- **Les permissions ne sont qu'un confort d'affichage.** Le menu et les boutons suivent les permissions de `/api/v1/moi`, mais la sécurité est dans l'API (algorithme A8). Ne supposez jamais qu'un écran caché suffit à protéger une action.
- **Droits de jury** : un membre ou un président de jury n'a ses droits que sur **sa** délibération (`peutSurDeliberation`, `src/lib/permissions.ts`).
- **L'administrateur de la plateforme** n'a accès à aucune donnée académique (BNF13) : il ne voit que les écoles clientes.
- **Données personnelles** (loi n° 2024/017) : aucune donnée réelle d'étudiant dans le dépôt, les tests, les captures d'écran, les maquettes ou les journaux. Uniquement des noms, matricules et notes fictifs.

## 3. Architecture

### 3.1. Vue d'ensemble

```
navigateur ──► Nginx (EC2, port 80)
                 ├─ /app/…  ──► client web Next.js (ce dépôt, conteneur, 127.0.0.1:3002)
                 │               ├─ src/proxy.ts           garde de navigation, renouvellement de session
                 │               ├─ Server Components       lecture des données (lireApi)
                 │               ├─ Server Functions        connexion, formulaires (appelerApi)
                 │               └─ /app/api/v1/… (relais)  appels du navigateur, jeton ajouté côté serveur
                 │                        │
                 ├─ /api/…  ──► API Delibera (delibera-core-api, 127.0.0.1:8080) ◄──┘
                 └─ /       ──► design system Délibéra UI (delibera-ui)
```

Détails et diagrammes : `docs/architecture.md`. Décisions : `docs/decisions/`.

- **basePath `/app`** : toutes les adresses du client commencent par `/app`. Dans le code, écrivez les chemins **sans** `/app` (`<Link href="/deliberations">`, `redirect(ROUTES.connexion)`) : Next.js l'ajoute. Les chemins sont centralisés dans `src/lib/routes.ts`.
- **Backend for frontend** : le navigateur ne voit jamais les jetons de l'API. Ils vivent dans des cookies `httpOnly`, `SameSite=Strict`, limités à `/app` (`src/lib/session/`). Seul le serveur Next.js appelle l'API.
- **Le navigateur n'appelle jamais `/api/v1` directement** : il passe par le relais `/app/api/v1/…` (`src/app/api/[...chemin]/route.ts`), au travers de `api` (`src/lib/api/client.ts`). Les routes `/api/v1/auth/**` ne sont pas relayées : seules les Server Functions du module `securite` les appellent.

### 3.2. Organisation du code

```
src/
├── proxy.ts                  garde de navigation (Next.js 16 : ex-middleware)
├── app/                      routes uniquement : pages minces qui assemblent les composants des modules
│   ├── (public)/             connexion, code, mot de passe oublié, réinitialisation, activation
│   ├── (compte)/             changement de mot de passe imposé
│   ├── (espace)/             espace connecté : coquille (barre supérieure, menu), une route par espace
│   ├── api/[...chemin]/      relais vers l'API
│   └── sante/                sonde de santé (Docker, déploiement)
├── components/
│   ├── ui/                   design system Délibéra UI : copié par la CLI, NE PAS MODIFIER
│   └── espace/               composants transverses du client (coquille, menu, accès, formulaires)
├── lib/                      code transverse : api/, session/, config, routes, navigation, permissions, format
├── modules/<module>/         un dossier par module métier (section 4)
└── test/                     configuration des tests, fabriques de données fictives
```

### 3.3. Où lire, où écrire

| Besoin | Moyen | Exemple |
| --- | --- | --- |
| Afficher des données au chargement d'une page | Server Component `async` sous `<Suspense>`, qui appelle `lireApi` (dans `modules/<m>/serveur.ts`) | Liste des délibérations |
| Données qui changent en séance, filtres, rafraîchissement | Client Component + TanStack Query, qui appelle `api.get` (dans `modules/<m>/api.ts` et `hooks/`) | Tableau de bord du jury, dossier étudiant |
| Formulaire de paramétrage ou d'authentification | Server Function (`"use server"`, `modules/<m>/actions.ts`) + `useActionState`, validation zod des deux côtés | Connexion, création d'une année |
| Action en séance (décision, relèvement) | `useMutation` + `api.post`, avec le `verrou`, puis invalidation des requêtes concernées | Statuer sur un dossier |
| Téléversement de fichier | `api.televerser` (multipart, relais en flux, 10 Mo) | Import des notes |
| Téléchargement (PDF, XLSX) | Lien `<a href={api.url("/proces-verbaux/12/fichier")}>` | PV, listes |

### 3.4. Cache Components (Next.js 16)

Le projet active `cacheComponents` (`next.config.ts`, décision 0002). Conséquences :
- Toute lecture de la session (`cookies()`, `lireMoi()`, `lireApi()`) se fait dans un composant placé **sous une frontière `<Suspense>`** (ou sous un `loading.tsx`). Sinon la construction échoue.
- Ne lisez pas la session au niveau supérieur d'un layout : placez la lecture dans un composant enfant sous `<Suspense>` (voir `src/components/espace/coquille-espace.tsx`).
- **`"use cache"` et `"use cache: remote"` sont interdits sur des données d'API** : une entrée de cache partagée entre requêtes pourrait servir les données d'une école à une autre (BNF12). `"use cache: private"` demande l'accord de l'équipe.

## 4. Modules du client

Un dossier par espace du client web, aligné sur les modules du cahier de conception (tableau 5). M6 (calcul) et M10 (notifications) n'ont pas d'écran propre : leurs résultats s'affichent dans M7 et M1.

| Dossier | Module | Routes du client | Cas d'utilisation | Itération |
| --- | --- | --- | --- | --- |
| `securite` | M1 Sécurité et accès | `/connexion`, `/connexion/code`, `/mot-de-passe-oublie`, `/reinitialisation`, `/activation`, `/mon-compte/mot-de-passe`, `/utilisateurs`, `/roles` | CU00, CU12, CU16, CU18 | 1 |
| `ecoles` | M2 Écoles clientes | `/plateforme/ecoles` | CU15 | 1 |
| `referentiel` | M3 Référentiel et maquettes | `/referentiel` | CU01 | 1 |
| `importation` | M5 Import | `/import` | CU03, CU07 | 1 et 2 |
| `regles` | M4 Règles et paramètres | `/regles`, `/parametres` | CU02, CU13 | 2 |
| `deliberation` | M6 et M7 Calcul, délibération et jury | `/deliberations/…` | CU04 à CU08, CU14, CU17 | 2 à 4 |
| `documents` | M8 Documents et statistiques | `/statistiques`, PV et listes dans `/deliberations/…` | CU09, CU10 | 4 |
| `audit` | M9 Audit | `/audit` | CU11 | 4 |

Contenu d'un dossier de module :

```
src/modules/<module>/
├── SPEC.md        spécifications du module côté client (section 10.1)
├── README.md      état de l'implémentation, créé avec la première fonctionnalité (section 10.2)
├── types.ts       types des DTO de l'API (mêmes noms que les records Java : SituationResponse…)
├── schemas.ts     schémas zod des formulaires
├── serveur.ts     lectures côté serveur ("server-only", lireApi)
├── actions.ts     Server Functions ("use server")
├── api.ts         appels du navigateur (api.get / api.post…)
├── hooks/         hooks TanStack Query (useSituations, useStatuer…)
└── composants/    composants du module (Server et Client Components)
```

- Les pages de `src/app` restent minces : elles composent les composants du module, sans logique métier.
- Un module n'importe pas les composants internes d'un autre module. Ce qui est partagé va dans `src/lib` ou `src/components/espace`.
- Ajouter un espace : une entrée dans `src/lib/navigation.ts` (libellé, icône, permissions) et une route dans `src/lib/routes.ts`.

## 5. Design system Délibéra UI et charte

- Les composants de `src/components/ui/` (et `src/lib/utils.ts`, `src/lib/with-ref.ts`) sont **copiés par la CLI** depuis la registry `http://15.188.107.127/r/`. **Ne les modifiez jamais ici** : une correction se fait dans le dépôt `delibera-ui`, puis le composant est réinstallé.
- Ajouter un composant :

  ```bash
  pnpm ds:ajouter data-grid sheet      # CLI delibera-ui du dossier voisin ../delibera-ui
  # ou, sans le dossier voisin :
  pnpm dlx shadcn@latest add http://15.188.107.127/r/data-grid.json
  ```

  Remplacer une version existante : ajouter `--overwrite`. Committez le composant et les dépendances ajoutées dans le même commit.
- **Un composant manque au design system ?** Ne le créez pas dans `src/components/ui`. Demandez à l'équipe : il est ajouté à `delibera-ui` (et à Figma), puis installé ici. En attendant une décision, un composant propre au client va dans `src/components/espace` ou dans le module, construit **avec** les composants du design system.
- **Aucune couleur, taille ou ombre en dur** : utilisez les classes issues des jetons (`bg-brand-blue`, `text-fg-tertiary`, `bg-bg-surface`, `shadow-(--shadow-card)`…). Le thème (`src/app/globals.css`, bloc `delibera:theme`) est généré : ne l'éditez pas.
- **Charte (cahier de conception §6.3)** :
  - notes avec une virgule et deux décimales (`formaterNote` : « 8,50 ») ; crédits avec `formaterCredits` ; dates dans le fuseau de l'école (`formaterDate`) ;
  - états de décision avec `DecisionBadge`, toujours accompagnés du libellé ;
  - actions dangereuses (clôture, réouverture, suspension d'une école) avec `ConfirmButton`, qui rappelle la conséquence ;
  - tableaux avec `DataGrid` : en-tête fixe, tri, filtres, pagination par 50, sélection multiple pour les décisions en lot ;
  - mise en page : `PageContainer`, `PageHeader` avec fil d'Ariane (école › année › délibération), filtres en tête, actions principales en bas à droite (`PageActions`) ;
  - `Toast` confirme une action terminée ; `EmptyState` remplace une liste vide.
- **Accessibilité (BNF07)** : chaque champ a un libellé, chaque icône seule a un `aria-label`, l'information ne repose jamais sur la seule couleur, tout est utilisable au clavier.
- **Textes** : en français, vocabulaire des cahiers (seuil, seuil limite, cas critique, options de relèvement, UE prioritaires, UE exigées, motif). Pas de jargon technique dans l'interface.

## 6. Sécurité

- **Jetons** : uniquement dans les cookies `httpOnly` posés par le serveur (`src/lib/session/`). Jamais dans `localStorage`, `sessionStorage`, une variable globale, l'URL ou un journal.
- **Navigateur** : aucune donnée personnelle dans `localStorage` ou `sessionStorage` (seulement des préférences d'affichage, après accord).
- **`"server-only"`** en tête de tout fichier qui lit les cookies ou appelle l'API côté serveur (`serveur.ts`). Un Client Component n'importe jamais un tel fichier.
- **Server Functions** : chacune valide ses entrées (zod) et laisse l'API décider des droits. Ne transmettez jamais à l'API un champ que l'utilisateur ne doit pas fixer (école, auteur, date).
- **Relais** (`src/app/api/[...chemin]/route.ts`) : ne le modifiez pas sans accord. Il refuse `/v1/auth/**`, n'accepte que les requêtes de modification venant du client lui-même (CSRF) et ne transmet qu'une liste fermée d'en-têtes.
- **Variables d'environnement** : seules les variables `NEXT_PUBLIC_*` atteignent le navigateur. N'en créez pas sans raison, et jamais pour un secret.
- **Redirections** : un paramètre `?suite=` passe toujours par `suiteSure` (`src/lib/routes.ts`).
- Pas de `dangerouslySetInnerHTML`, pas d'`eval`, pas de script externe, pas de police ou d'image chargée depuis Internet.
- **Session fictive** (`DELIBERA_SESSION_FICTIVE=true`) : pour développer sans l'API. Elle est ignorée en production ; ne la contournez pas.

## 7. Conventions de code

### 7.1. Langue et nommage

- **TypeScript strict.** `any` est interdit ; `unknown` puis un rétrécissement, ou un type précis.
- **Noms métier en français, sans accents dans les identifiants** : `Deliberation`, `lireSituations`, `formaterNote`, `peutSurDeliberation`. Les types des DTO reprennent **exactement** les noms des records de l'API (`EcoleResponse`, `CreerEcoleRequest`).
- Fichiers et dossiers en minuscules avec des tirets : `tableau-deliberation.tsx`, `use-situations.ts`. Composants en PascalCase : `TableauDeliberation`. Hooks : `useSituations`.
- Segments d'URL en français, en minuscules avec des tirets : `/deliberations/[id]/dossiers/[situationId]`.
- Commentaires, messages d'erreur, textes d'interface et messages de commit : **en français**. Citez la référence quand elle existe : « CU06 », « algorithme A6 », « BNF12 ».

### 7.2. Composants

- **Server Component par défaut.** `"use client"` seulement pour l'interactivité (état, événements, hooks du navigateur), le plus bas possible dans l'arbre.
- Props typées ; pas de valeurs magiques ; un composant par fichier, sauf petits sous-composants privés.
- Formulaires : React Hook Form + zod côté navigateur quand il y a de l'interactivité, `useActionState` + Server Function pour les formulaires simples. Les erreurs de champ viennent de `ErreurApi.erreursParChamp`.
- Mise en forme : Prettier (`pnpm format`), ESLint sans avertissement (`pnpm lint`).

### 7.3. Erreurs

- Toute erreur de l'API est une `ErreurApi` (`src/lib/api/probleme.ts`, format RFC 9457). **Le client s'appuie sur `code`, jamais sur le texte** du message.
- 401 : retour à la connexion (automatique). 403 : `AccesRefuse`. 404 : `notFound()` ou état vide. 409 : message « modifié par quelqu'un d'autre » + rechargement. 422 : afficher `detail`. 502 : réessayer.
- Une erreur imprévue d'un Server Component remonte au `error.tsx` le plus proche, qui n'affiche jamais de détail technique.
- Jamais de `catch` vide : on traite, on affiche ou on relance.

## 8. Tests

### 8.1. Quels tests écrire

| Type | Outil | Ce qui est testé | Fichier |
| --- | --- | --- | --- |
| Unitaire | Vitest | Fonctions de `src/lib` et des modules (format, permissions, schémas, appels `api`) | `<fichier>.test.ts` à côté du fichier testé |
| Composant | Vitest + Testing Library | Client Components : affichage selon les données et les permissions, interactions, erreurs | `<composant>.test.tsx` |
| Route Handler | Vitest | Relais et routes de `src/app/api` (règles de sécurité) | `route.test.ts` |
| Fumée | Pipeline (`.github/workflows/ci-cd.yml`) | L'image démarre, `/app/sante`, redirection vers la connexion, relais protégé | — |

Les Server Components asynchrones ne se testent pas avec Vitest : isolez leur logique dans des fonctions testables.

### 8.2. Règles obligatoires

- Chaque fonctionnalité est livrée **avec ses tests**, dans la même branche.
- Chaque écran a au moins un test qui vérifie ce qui est montré ou caché selon les permissions.
- Chaque formulaire a un test du cas valide et d'au moins une erreur (validation locale ou erreur de l'API avec son `code`).
- Chaque action en séance a un test du conflit 409.
- Chaque correction de bogue commence par un test qui reproduit le bogue.
- Nom des tests : une phrase en français qui décrit le comportement. Corps en trois temps : `// Étant donné`, `// Quand`, `// Alors`.
- Données **fictives uniquement**, construites par des fabriques dans `src/test/fixtures/`.
- Un test ne dépend ni de l'ordre d'exécution, ni de l'heure système (`vi.setSystemTime`), ni du réseau (`fetch` simulé).
- `it.skip` est interdit sans justification écrite et accord de l'équipe. Il est interdit de supprimer ou d'affaiblir un test pour faire passer le pipeline.
- Objectif de couverture : 70 % sur `src/lib` et `src/modules` (`pnpm test:couverture`).

### 8.3. Lancer les vérifications

```bash
pnpm verifier      # ESLint + types + tests + Prettier
pnpm build         # construction de production (attrape les erreurs de Cache Components)
```

**`pnpm verifier` et `pnpm build` doivent réussir avant tout commit poussé.**

## 9. API et contrat

- Les routes de l'API sont celles du `SPEC.md` du module correspondant dans `delibera-core-api` (section « API REST »), puis du Swagger une fois codées. Un écart entre les deux se signale à l'équipe.
- Les types de `types.ts` suivent le Swagger. Tant que la route n'existe pas, ils suivent le `SPEC.md` de l'API et sont marqués `/** [Proposition] contrat attendu */`.
- Chemins d'API relatifs à `/api/v1`, au pluriel, en minuscules avec des tirets : `api.get("/deliberations/12/situations")`.
- Listes paginées : type `Page<T>` (`src/lib/api/client.ts`), pagination par 50.
- Un besoin d'API qui n'existe pas encore : ne le simulez pas en dur dans le client. Notez-le dans le `SPEC.md` du module (« Besoins envers l'API ») et prévenez l'équipe backend.

## 10. Documentation de chaque fonctionnalité

### 10.1. SPEC.md du module

- Il existe pour les huit modules. Plan : sources ; rôle ; écrans (route, cas d'utilisation, permission, composants, maquette) ; contrat de l'API ; règles d'interface ; erreurs à gérer ; tests d'acceptation ; questions ouvertes.
- C'est **la référence pour implémenter les écrans du module**. Ce qu'il marque **[Proposition]** doit être validé avant d'être codé.
- Un agent ne le modifie pas de sa propre initiative. Il y reporte une décision de l'équipe (en retirant la marque **[Proposition]**) ou y ajoute une question ouverte, dans la même branche.

### 10.2. README de module

Créé avec la première fonctionnalité du module, dans son dossier, et mis à jour **dans la même branche** que le code :

```markdown
# <Module> – client web

## Écrans
| Écran | Route | Cas d'utilisation | État | Branche |
| --- | --- | --- | --- | --- |

## Appels à l'API
| Verbe | Route de l'API | Où (serveur.ts, api.ts, actions.ts) | Erreurs traitées |
| --- | --- | --- | --- |

## Composants
Composants du module et composants du design system utilisés.

## Tests
Fichiers de test et ce qu'ils couvrent.

## Écarts avec le SPEC.md
Ce qui diffère, avec la décision correspondante (docs/decisions/).
```

### 10.3. Décisions

Tout écart par rapport au cahier de conception, tout choix technique notable et toute nouvelle dépendance font l'objet d'une fiche `docs/decisions/NNNN-titre-court.md` : contexte, décision, conséquences, alternatives écartées. Les fiches 0001 à 0005 expliquent les choix déjà faits (Next.js, Cache Components, chemin `/app`, jetons en cookies, Vitest).

### 10.4. README racine

Mettez-le à jour quand une fonctionnalité change le démarrage, la configuration, les variables d'environnement ou l'avancement des itérations.

## 11. Git et branches

### 11.1. Branches

| Branche | Rôle | Qui écrit dessus |
| --- | --- | --- |
| `main` | Version en production : **chaque push sur `main` déploie le client web** sur l'EC2 (README, « Déploiement continu »). Étiquette `v0.<itération>.0` à la fin de chaque itération. | Fusion depuis `develop` uniquement, par l'équipe |
| `develop` | Intégration | Fusion des demandes de fusion relues |
| `feature/<module>-<sujet>` | Une fonctionnalité | L'agent ou le développeur qui l'a créée |
| `fix/<module>-<sujet>` | Une correction | Idem |
| `docs/<sujet>` | Documentation seule | Idem |

- Les branches de travail partent **toujours de `develop` à jour** : `git switch develop && git pull && git switch -c feature/<module>-<sujet>`.
- Nom de branche en minuscules, avec des tirets, sans accents : `feature/securite-utilisateurs`, `feature/deliberation-tableau-de-bord`, `fix/importation-apercu`.
- **Une branche = une fonctionnalité** (en général un écran ou un cas d'utilisation).
- Un agent ne pousse **jamais** sur `main` ou `develop`, ne fusionne jamais lui-même et n'utilise jamais `git push --force` sur une branche partagée.

### 11.2. Commits

- Format **Conventional Commits**, en français : `<type>(<module>): <description à l'infinitif>`.
- Types : `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `build`, `ci`, `perf`.
- Exemples : `feat(deliberation): afficher le tableau de bord du jury`, `fix(securite): conserver l'e-mail après un échec de connexion`.
- Un commit = un changement logique, qui passe `pnpm verifier`.
- Un commit écrit par un agent se termine par la ligne `Co-Authored-By: <nom de l'agent> <adresse>`.
- Jamais de `.env.local`, de secret, de donnée réelle, de `.next/` ou de `node_modules/` dans un commit.

### 11.3. Demande de fusion

Vers `develop`, avec le modèle `.github/pull_request_template.md` : fonctionnalité, cas d'utilisation, écrans, appels à l'API, tests, captures (données fictives), écarts, propositions validées, questions ouvertes. La relecture par un membre de l'équipe est obligatoire.

## 12. Déroulé d'une nouvelle fonctionnalité (pour un agent)

1. **Lire** : ce fichier et le `README.md` ; le `SPEC.md` du module ; le `SPEC.md` du module de l'API (cas d'utilisation, routes, codes d'erreur) ; le Swagger si la route existe ; la maquette (cahier §6.4, Figma, documentation du design system).
2. **Clarifier** : relever les **[Proposition]**, les **questions ouvertes** et les routes d'API manquantes. Les poser à l'équipe **avant de coder**.
3. **Créer la branche** depuis `develop` à jour.
4. **Documenter le plan** : créer ou mettre à jour le README du module (écran « en cours », appels prévus, tests prévus).
5. **Implémenter dans cet ordre** :
   1. les types (`types.ts`) et schémas (`schemas.ts`) ;
   2. les appels (`serveur.ts`, `api.ts`, `actions.ts`) et leurs tests ;
   3. les composants manquants du design system (section 5) ;
   4. les composants du module et leurs tests ;
   5. la page dans `src/app/(espace)/…` et, si besoin, l'entrée de navigation ;
   6. la gestion des erreurs (401, 403, 409, 422, 502) et des états vides et de chargement.
6. **Vérifier** : `pnpm verifier` et `pnpm build` ; essai dans le navigateur (`pnpm dev`, avec l'API locale ou la session fictive), au clavier, et avec un rôle qui n'a pas la permission.
7. **Finaliser la documentation** : README du module ; `SPEC.md` si l'équipe a tranché ; README racine si besoin ; fiche de décision en cas d'écart.
8. **Committer et pousser** la branche, puis préparer la demande de fusion.
9. **Rendre compte** : ce qui est fait et ce qui ne l'est pas, les écarts, les questions ouvertes, les commandes pour vérifier.

## 13. Ce qu'un agent demande avant de faire

- Ajouter, retirer ou changer la version d'une dépendance (`package.json`).
- Modifier `next.config.ts`, `src/proxy.ts`, le relais `src/app/api/[...chemin]/route.ts`, `src/lib/session/` ou `src/lib/api/`.
- Modifier un composant de `src/components/ui` (réponse attendue : non, voir section 5).
- S'écarter du `SPEC.md`, du cahier de conception ou du design system.
- Implémenter un élément marqué **[Proposition]**.
- Utiliser `"use cache"` sous quelque forme que ce soit.
- Modifier le pipeline, le `Dockerfile`, `compose.yaml` ou un fichier de `deploy/`.
- Supprimer des fichiers, ou toute action sur `main` ou `develop`.

## 14. Interdits

- Calculer dans le client une note, un crédit, une dette, une proposition ou un seuil.
- Envoyer un identifiant d'école à l'API.
- Stocker un jeton ou une donnée personnelle dans le navigateur, ou les écrire dans un journal.
- Appeler l'API depuis le navigateur sans passer par le relais `/app/api/v1`.
- Modifier `src/components/ui`, le bloc `delibera:theme` de `globals.css`, `src/lib/utils.ts` ou `src/lib/with-ref.ts`.
- Écrire une couleur, une taille ou une ombre en dur au lieu des jetons du design system.
- Utiliser `any`, `dangerouslySetInnerHTML` ou un `catch` vide.
- Utiliser des données réelles (noms, matricules, notes) dans le code, les tests, les captures ou les maquettes.
- Désactiver, supprimer ou affaiblir un test pour faire passer le pipeline.
- Pousser sur `main` ou `develop`, forcer un push sur une branche partagée.

## 15. Environnement technique

| Élément | Version | Point d'attention |
| --- | --- | --- |
| Node.js | 24 LTS (`.nvmrc`) | Image Docker `node:24-alpine` |
| pnpm | 10.18 (`packageManager`, via corepack) | `pnpm install --frozen-lockfile` en intégration continue |
| Next.js | 16.4 | App Router, Turbopack, `basePath: "/app"`, `output: "standalone"`, Cache Components |
| React | 19.3 | `useActionState`, `use()`, Server Functions |
| TypeScript | 5.9 | Mode strict |
| Tailwind CSS | 4.3 | Chargé par `@tailwindcss/turbopack` (pas de PostCSS), jetons du design system |
| Design system | Délibéra UI (Radix UI, `radix-ui`) | Composants copiés dans `src/components/ui` |
| Données | TanStack Query 5, zod 4, React Hook Form 7 | |
| Tests | Vitest 5, Testing Library, jsdom | |
| Qualité | ESLint 9 (`eslint-config-next`), Prettier 3 | |

**Pièges de Next.js 16 pour un agent habitué à Next.js 13 à 15 :**
- `middleware.ts` est remplacé par **`proxy.ts`** (fonction `proxy`, exécutée en Node.js).
- `cookies()`, `headers()`, `params` et `searchParams` sont **asynchrones** : `await cookies()`, `const { id } = await params`.
- Un formulaire qui dépend de l'adresse (`?suite=`, `?jeton=`) lit `searchParams` **dans la page, côté serveur**, sous `<Suspense>`, et reçoit la valeur en propriété. Avec `useSearchParams()` dans un composant client, le HTML ne contient que le squelette : le formulaire n'apparaît qu'après le chargement du JavaScript (et l'essai de fumée du pipeline échoue).
- Avec **Cache Components**, une lecture de requête hors `<Suspense>` fait échouer `next build` (section 3.4).
- `error.tsx` reçoit `{ error, retry }` (et non plus `reset` seul) ; `error` peut ne pas être une `Error`.
- `next lint` n'existe plus : `pnpm lint` lance ESLint directement.
- Les types `PageProps<"/route">` et `LayoutProps<"/route">` sont générés (`next typegen`, lancé par `pnpm typecheck`).
- `forbidden()` et `unauthorized()` sont expérimentaux : ne les utilisez pas (composant `AccesRefuse`).
- **En cas de doute, lisez la documentation livrée avec la version installée** : `node_modules/next/dist/docs/`.

**Commandes utiles :**

```bash
pnpm dev                    # http://localhost:3000/app, rechargement à chaud
pnpm verifier               # ESLint + types + tests + Prettier
pnpm build && pnpm start    # version de production en local
pnpm test:watch             # tests en continu
pnpm ds:ajouter <composant> # composant du design system
docker compose up -d --build  # image de production en local (http://localhost:3000/app)
```

**Configuration** : `.env.example` documente chaque variable. En local, copiez-le en `.env.local` (jamais committé). En production, l'instance fournit `/etc/delibera-front/delibera-front.env` (Terraform, dépôt `infra`). Une variable nouvelle est ajoutée à `.env.example` et signalée dans la demande de fusion.

## 16. Définition de « terminé »

Une fonctionnalité est terminée quand **toutes** ces cases sont cochées :

- [ ] Le comportement correspond au `SPEC.md` du module, ou l'écart est consigné et accepté.
- [ ] Les éléments **[Proposition]** utilisés ont été validés, et le `SPEC.md` est mis à jour.
- [ ] Les écrans suivent la maquette et le design system (aucun composant de `src/components/ui` modifié, aucune couleur en dur).
- [ ] Les textes sont en français, avec le vocabulaire des cahiers ; notes, crédits et dates passent par `src/lib/format.ts`.
- [ ] Les permissions et les droits de jury adaptent l'affichage ; les erreurs 401, 403, 409, 422 et 502 sont traitées.
- [ ] Les états de chargement (`Skeleton`, `loading.tsx`) et les états vides (`EmptyState`) existent.
- [ ] L'écran est utilisable au clavier, et chaque champ a un libellé.
- [ ] Les tests sont écrits et passent ; `pnpm verifier` et `pnpm build` réussissent.
- [ ] Le README du module est à jour.
- [ ] Aucun secret, aucune donnée réelle, aucune valeur de règle en dur.
- [ ] La branche est poussée et la demande de fusion vers `develop` est rédigée.
