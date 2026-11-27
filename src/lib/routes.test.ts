import { describe, expect, it } from "vitest";

import { estRoutePublique, ROUTES, suiteSure } from "./routes";

describe("suiteSure", () => {
  it("garde un chemin interne avec ses paramètres", () => {
    // Étant donné / Quand / Alors
    expect(suiteSure("/deliberations/12?etat=A_DELIBERER")).toBe(
      "/deliberations/12?etat=A_DELIBERER",
    );
  });

  it.each([
    ["absent", undefined],
    ["vide", ""],
    ["adresse d'un autre site", "https://exemple.org/piege"],
    ["chemin protocole-relatif", "//exemple.org"],
    ["barre oblique inverse", "/\\exemple.org"],
    ["relatif sans barre", "deliberations"],
  ])("renvoie l'accueil pour un retour %s", (_cas, suite) => {
    expect(suiteSure(suite)).toBe(ROUTES.accueil);
  });

  it("ne renvoie jamais vers une page publique après connexion", () => {
    expect(suiteSure("/connexion?suite=/audit")).toBe(ROUTES.accueil);
  });
});

describe("estRoutePublique", () => {
  it("reconnaît les pages sans session et leurs sous-pages", () => {
    expect(estRoutePublique("/connexion")).toBe(true);
    expect(estRoutePublique("/connexion/code")).toBe(true);
    expect(estRoutePublique("/activation")).toBe(true);
  });

  it("refuse les pages de travail et les préfixes trompeurs", () => {
    expect(estRoutePublique("/")).toBe(false);
    expect(estRoutePublique("/deliberations")).toBe(false);
    expect(estRoutePublique("/connexionpiege")).toBe(false);
    expect(estRoutePublique(ROUTES.changerMotDePasse)).toBe(false);
  });
});
