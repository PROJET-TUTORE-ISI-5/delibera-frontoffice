import { describe, expect, it } from "vitest";

import { fabriquerMoi } from "@/test/fixtures/moi";

import { libelleRole } from "./types";

describe("libelleRole", () => {
  it("affiche le rôle de la première affectation", () => {
    expect(libelleRole(fabriquerMoi())).toBe("Gestionnaire académique");
  });

  it("présente un compte sans école comme administrateur de la plateforme", () => {
    expect(libelleRole(fabriquerMoi({ ecole: undefined }))).toBe("Administrateur de la plateforme");
  });

  it("présente un membre de jury sans rôle comme membre du jury", () => {
    const moi = fabriquerMoi({
      affectations: [],
      jurys: [{ deliberationId: 3, qualite: "MEMBRE" }],
    });
    expect(libelleRole(moi)).toBe("Membre du jury");
  });
});
