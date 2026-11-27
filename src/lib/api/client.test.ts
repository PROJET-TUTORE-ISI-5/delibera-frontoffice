import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "./client";
import { ErreurApi } from "./probleme";

function simulerFetch(reponse: Response) {
  const appel = vi.fn<typeof fetch>().mockResolvedValue(reponse);
  vi.stubGlobal("fetch", appel);
  return appel;
}

afterEach(() => vi.unstubAllGlobals());

describe("api (appels du navigateur par le relais /app/api/v1)", () => {
  it("passe par le relais du client web, avec les paramètres non vides", async () => {
    const appel = simulerFetch(Response.json({ content: [] }));
    await api.get("/deliberations/12/situations", { etat: "A_DELIBERER", filiere: "", page: 0 });
    expect(appel).toHaveBeenCalledWith(
      "/app/api/v1/deliberations/12/situations?etat=A_DELIBERER&page=0",
      expect.objectContaining({ method: "GET", credentials: "same-origin" }),
    );
  });

  it("envoie un corps JSON", async () => {
    const appel = simulerFetch(new Response(null, { status: 204 }));
    await api.post("/propositions/3/decision", { etat: "ADMIS", verrou: 2 });
    const [, options] = appel.mock.calls[0]!;
    expect(options?.body).toBe('{"etat":"ADMIS","verrou":2}');
    expect(options?.headers).toMatchObject({ "content-type": "application/json" });
  });

  it("laisse le navigateur fixer l'en-tête d'un téléversement", async () => {
    const appel = simulerFetch(Response.json({ id: 1 }, { status: 201 }));
    const formulaire = new FormData();
    formulaire.set("type", "NOTES");
    await api.televerser("/imports", formulaire);
    const [, options] = appel.mock.calls[0]!;
    expect(options?.body).toBe(formulaire);
    expect(options?.headers).not.toHaveProperty("content-type");
  });

  it("lève une ErreurApi avec le code métier", async () => {
    simulerFetch(
      Response.json(
        { status: 422, code: "MOTIF_OBLIGATOIRE", detail: "Le motif est obligatoire." },
        { status: 422, headers: { "content-type": "application/problem+json" } },
      ),
    );
    await expect(api.post("/propositions/3/decision", {})).rejects.toMatchObject({
      status: 422,
      code: "MOTIF_OBLIGATOIRE",
    });
  });

  it("transforme une panne réseau en API_INJOIGNABLE", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const erreur = await api.get("/moi").catch((e: unknown) => e);
    expect(erreur).toBeInstanceOf(ErreurApi);
    expect((erreur as ErreurApi).code).toBe("API_INJOIGNABLE");
  });
});
