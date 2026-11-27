import { describe, expect, it } from "vitest";

import { aUneDesPermissions, peutSurDeliberation, type Habilitations } from "./permissions";

const president: Habilitations = {
  permissions: ["STATS_CONSULTER"],
  jurys: [{ deliberationId: 7, qualite: "PRESIDENT" }],
};

describe("peutSurDeliberation (algorithme A8, droits de jury)", () => {
  it("accorde au président la validation de SA délibération", () => {
    expect(peutSurDeliberation(president, "DELIB_VALIDER", 7)).toBe(true);
  });

  it("refuse la validation d'une autre délibération", () => {
    expect(peutSurDeliberation(president, "DELIB_VALIDER", 8)).toBe(false);
  });

  it("refuse la validation à un simple membre", () => {
    const membre: Habilitations = {
      permissions: [],
      jurys: [{ deliberationId: 7, qualite: "MEMBRE" }],
    };
    expect(peutSurDeliberation(membre, "DOSSIER_STATUER", 7)).toBe(true);
    expect(peutSurDeliberation(membre, "DELIB_VALIDER", 7)).toBe(false);
  });

  it("accepte une permission accordée par un rôle, quelle que soit la délibération", () => {
    expect(peutSurDeliberation(president, "STATS_CONSULTER", 99)).toBe(true);
  });
});

describe("aUneDesPermissions", () => {
  it("ignore les droits de jury", () => {
    expect(aUneDesPermissions(president, ["DOSSIER_STATUER"])).toBe(false);
    expect(aUneDesPermissions(president, ["AUDIT_CONSULTER", "STATS_CONSULTER"])).toBe(true);
  });
});
