## Objet

<!-- Ce que change la demande, en une ou deux phrases. -->

## Cas d'utilisation et exigences

<!-- Exemple : CU05, BF12, BNF08. Lien vers le SPEC.md du module concerné. -->

## Écrans touchés

<!-- Routes du client (/app/...) et composants du design system utilisés. Capture d'écran si l'interface change. -->

## Vérifications

- [ ] `pnpm verifier` passe (lint, types, format, tests)
- [ ] `pnpm build` passe
- [ ] Aucune règle métier calculée dans le client (BNF02) ; aucun `ecoleId` envoyé par le client
- [ ] Permissions vérifiées dans l'interface **et** laissées à l'API (403 géré)
- [ ] Erreurs de l'API affichées (`application/problem+json`, 409 de verrou si le module en a)
- [ ] Composants de `src/components/ui` non modifiés ; nouveaux composants ajoutés par `pnpm ds:ajouter`
- [ ] Aucune donnée personnelle réelle (tests, captures, exemples)
- [ ] `SPEC.md` du module, `AGENT.md` ou une décision (`docs/decisions/`) mis à jour si besoin

## Points à valider

<!-- Éléments marqués [Proposition], questions ouvertes, contrat d'API encore absent du Swagger. -->
