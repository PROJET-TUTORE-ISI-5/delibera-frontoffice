import { describe, expect, it } from "vitest";

import { elementActif, hrefsVisibles } from "./navigation";
import type { Habilitations } from "./permissions";
import { ROUTES } from "./routes";

const gestionnaire: Habilitations = {
  permissions: [
    "REGLE_GERER",
    "DONNEES_IMPORTER",
    "PREDELIB_LANCER",
    "RATTRAPAGE_SAISIR",
    "DOSSIER_CONSULTER",
    "PV_GENERER",
    "RECLAMATION_TRAITER",
    "STATS_CONSULTER",
  ],
  jurys: [],
};

describe("hrefsVisibles", () => {
  it("montre au gestionnaire académique ses espaces, sans l'administration", () => {
    // Étant donné un gestionnaire (rôle prédéfini, cahier d'analyse §3.5)
    // Quand on calcule son menu
    const hrefs = hrefsVisibles(gestionnaire);
    // Alors
    expect(hrefs).toEqual(
      expect.arrayContaining([
        ROUTES.accueil,
        ROUTES.deliberations,
        ROUTES.importation,
        ROUTES.regles,
        ROUTES.statistiques,
      ]),
    );
    expect(hrefs).not.toContain(ROUTES.utilisateurs);
    expect(hrefs).not.toContain(ROUTES.audit);
    expect(hrefs).not.toContain(ROUTES.ecoles);
  });

  it("montre les délibérations à un membre de jury sans rôle (droits de jury, CU17)", () => {
    const membre: Habilitations = {
      permissions: [],
      jurys: [{ deliberationId: 4, qualite: "MEMBRE" }],
    };
    expect(hrefsVisibles(membre)).toEqual([ROUTES.accueil, ROUTES.deliberations]);
  });

  it("ne montre que les écoles à l'administrateur de la plateforme (BNF13)", () => {
    const plateforme: Habilitations = { permissions: ["ECOLE_GERER"], jurys: [] };
    expect(hrefsVisibles(plateforme)).toEqual([ROUTES.accueil, ROUTES.ecoles]);
  });
});

describe("elementActif", () => {
  const hrefs = [ROUTES.accueil, ROUTES.deliberations, ROUTES.importation];

  it("retient l'entrée la plus précise pour une sous-page", () => {
    expect(elementActif("/deliberations/12/dossiers/3", hrefs)).toBe(ROUTES.deliberations);
  });

  it("n'active l'accueil que sur l'accueil", () => {
    expect(elementActif("/", hrefs)).toBe(ROUTES.accueil);
    expect(elementActif("/inconnu", hrefs)).toBeUndefined();
  });
});
