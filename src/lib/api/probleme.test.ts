import { describe, expect, it } from "vitest";

import { erreurDepuisReponse, ErreurApi } from "./probleme";

describe("erreurDepuisReponse (RFC 9457)", () => {
  it("lit le code métier et les violations d'un problem+json", async () => {
    // Étant donné une erreur de validation de l'API
    const reponse = Response.json(
      {
        status: 400,
        title: "Données invalides",
        code: "VALIDATION",
        violations: [{ champ: "motif", message: "Le motif est obligatoire." }],
      },
      { status: 400, headers: { "content-type": "application/problem+json" } },
    );
    // Quand
    const erreur = await erreurDepuisReponse(reponse);
    // Alors
    expect(erreur).toBeInstanceOf(ErreurApi);
    expect(erreur.code).toBe("VALIDATION");
    expect(erreur.erreursParChamp).toEqual({ motif: "Le motif est obligatoire." });
  });

  it("donne un message utilisateur clair pour un conflit de verrou (409)", async () => {
    const erreur = await erreurDepuisReponse(
      Response.json({ status: 409, code: "MODIFICATION_CONCURRENTE" }, { status: 409 }),
    );
    expect(erreur.estConflit).toBe(true);
    expect(erreur.messageUtilisateur).toMatch(/modifié par quelqu'un d'autre/);
  });

  it("se contente du statut quand le corps n'est pas du JSON", async () => {
    const erreur = await erreurDepuisReponse(new Response("Bad Gateway", { status: 502 }));
    expect(erreur.status).toBe(502);
    expect(erreur.code).toBeUndefined();
    expect(erreur.messageUtilisateur).toMatch(/injoignable/);
  });
});
