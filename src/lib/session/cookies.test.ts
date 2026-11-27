import { describe, expect, it } from "vitest";

import {
  COOKIE_ACCES,
  COOKIE_RENOUVELLEMENT,
  cookiesDeSession,
  estJetonsSession,
  MARGE_EXPIRATION_S,
  remplacerCookies,
} from "./cookies";

describe("cookiesDeSession", () => {
  const reglages = { basePath: "/app", secure: false, dureeRenouvellement: 28_800 };

  it("fait expirer le cookie d'accès avant le jeton (15 min moins la marge)", () => {
    const [acces, renouvellement] = cookiesDeSession(
      { jetonAcces: "a", jetonRenouvellement: "r", expireDans: 900 },
      reglages,
    );
    expect(acces).toMatchObject({ name: COOKIE_ACCES, value: "a" });
    expect(acces!.options.maxAge).toBe(900 - MARGE_EXPIRATION_S);
    expect(renouvellement).toMatchObject({ name: COOKIE_RENOUVELLEMENT, value: "r" });
    expect(renouvellement!.options.maxAge).toBe(28_800);
  });

  it("limite les cookies au client web et les rend illisibles par le JavaScript", () => {
    const [acces] = cookiesDeSession(
      { jetonAcces: "a", jetonRenouvellement: "r", expireDans: 900 },
      reglages,
    );
    expect(acces!.options).toMatchObject({ httpOnly: true, sameSite: "strict", path: "/app" });
  });
});

describe("estJetonsSession", () => {
  it("accepte une réponse complète", () => {
    expect(estJetonsSession({ jetonAcces: "a", jetonRenouvellement: "r", expireDans: 900 })).toBe(
      true,
    );
  });

  it.each([
    null,
    {},
    { jetonAcces: "", jetonRenouvellement: "r", expireDans: 900 },
    { jetonAcces: "a", jetonRenouvellement: "r", expireDans: 0 },
    { jetonAcces: "a", expireDans: 900 },
  ])("refuse %j", (valeur) => {
    expect(estJetonsSession(valeur)).toBe(false);
  });
});

describe("remplacerCookies", () => {
  it("remplace les jetons et garde les autres cookies", () => {
    const entete = remplacerCookies(
      [
        { name: "autre", value: "1" },
        { name: COOKIE_ACCES, value: "ancien" },
      ],
      { [COOKIE_ACCES]: "neuf", [COOKIE_RENOUVELLEMENT]: "r2" },
    );
    expect(entete).toBe(`autre=1; ${COOKIE_ACCES}=neuf; ${COOKIE_RENOUVELLEMENT}=r2`);
  });
});
