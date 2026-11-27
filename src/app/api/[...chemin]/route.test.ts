import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { COOKIE_ACCES, COOKIE_RENOUVELLEMENT } from "@/lib/session/cookies";

// Cookies de la requête, simulés pour next/headers
let cookiesRequete: Record<string, string> = {};
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (nom: string) =>
      nom in cookiesRequete ? { name: nom, value: cookiesRequete[nom] } : undefined,
  }),
}));

const { GET, POST } = await import("./route");

const contexte = (...chemin: string[]) => ({ params: Promise.resolve({ chemin }) });
const requete = (url: string, init?: ConstructorParameters<typeof NextRequest>[1]) =>
  new NextRequest(`http://15.188.107.127/app/api/${url}`, init);

let fetchApi: ReturnType<typeof vi.fn<typeof fetch>>;

beforeEach(() => {
  cookiesRequete = {};
  fetchApi = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ ok: true }));
  vi.stubGlobal("fetch", fetchApi);
});
afterEach(() => vi.unstubAllGlobals());

describe("relais /app/api/v1 (backend for frontend)", () => {
  it("ajoute le jeton de session et conserve la recherche", async () => {
    // Étant donné une session ouverte
    cookiesRequete[COOKIE_ACCES] = "jeton-a";
    // Quand le navigateur lit une liste
    const reponse = await GET(
      requete("v1/deliberations?etat=ADMIS"),
      contexte("v1", "deliberations"),
    );
    // Alors l'API reçoit le jeton et la même recherche
    expect(reponse.status).toBe(200);
    const [url, options] = fetchApi.mock.calls[0]!;
    expect(String(url)).toBe("http://127.0.0.1:8080/api/v1/deliberations?etat=ADMIS");
    expect(new Headers(options?.headers).get("authorization")).toBe("Bearer jeton-a");
  });

  it("ne transmet ni les cookies ni les en-têtes non prévus", async () => {
    cookiesRequete[COOKIE_ACCES] = "jeton-a";
    await GET(
      requete("v1/moi", {
        headers: { cookie: "delibera_acces=jeton-a", "x-piege": "1", accept: "application/json" },
      }),
      contexte("v1", "moi"),
    );
    const enTetes = new Headers(fetchApi.mock.calls[0]![1]?.headers);
    expect(enTetes.get("cookie")).toBeNull();
    expect(enTetes.get("x-piege")).toBeNull();
    expect(enTetes.get("accept")).toBe("application/json");
  });

  it.each([
    ["les routes d'authentification", ["v1", "auth", "connexion"]],
    ["une autre version de l'API", ["v2", "deliberations"]],
    ["une remontée de dossier", ["v1", "..", "actuator"]],
  ])("refuse %s (404)", async (_cas, chemin) => {
    cookiesRequete[COOKIE_ACCES] = "jeton-a";
    const reponse = await GET(requete(chemin.join("/")), contexte(...chemin));
    expect(reponse.status).toBe(404);
    expect(fetchApi).not.toHaveBeenCalled();
  });

  it("répond 401 SESSION_EXPIREE sans session", async () => {
    const reponse = await GET(requete("v1/moi"), contexte("v1", "moi"));
    expect(reponse.status).toBe(401);
    expect(await reponse.json()).toMatchObject({ code: "SESSION_EXPIREE" });
  });

  it("renouvelle la session puis relaie, et pose les nouveaux cookies", async () => {
    cookiesRequete[COOKIE_RENOUVELLEMENT] = "r-1";
    fetchApi
      .mockResolvedValueOnce(
        Response.json({ jetonAcces: "a-2", jetonRenouvellement: "r-2", expireDans: 900 }),
      )
      .mockResolvedValueOnce(Response.json({ ok: true }));
    const reponse = await GET(requete("v1/moi"), contexte("v1", "moi"));
    expect(reponse.status).toBe(200);
    expect(String(fetchApi.mock.calls[0]![0])).toMatch(/\/api\/v1\/auth\/renouvellement$/);
    expect(new Headers(fetchApi.mock.calls[1]![1]?.headers).get("authorization")).toBe(
      "Bearer a-2",
    );
    const poses = reponse.headers.getSetCookie().join(" | ");
    expect(poses).toContain(`${COOKIE_ACCES}=a-2`);
    expect(poses).toContain("HttpOnly");
  });

  it("refuse une modification venant d'un autre site (CSRF)", async () => {
    cookiesRequete[COOKIE_ACCES] = "jeton-a";
    const reponse = await POST(
      requete("v1/propositions/3/decision", {
        method: "POST",
        headers: { "sec-fetch-site": "cross-site" },
        body: "{}",
      }),
      contexte("v1", "propositions", "3", "decision"),
    );
    expect(reponse.status).toBe(403);
    expect(fetchApi).not.toHaveBeenCalled();
  });

  it("relaie une modification du client web et renvoie l'erreur métier telle quelle", async () => {
    cookiesRequete[COOKIE_ACCES] = "jeton-a";
    fetchApi.mockResolvedValueOnce(
      Response.json(
        { status: 422, code: "MOTIF_OBLIGATOIRE" },
        { status: 422, headers: { "content-type": "application/problem+json" } },
      ),
    );
    const reponse = await POST(
      requete("v1/propositions/3/decision", {
        method: "POST",
        headers: { "sec-fetch-site": "same-origin", "content-type": "application/json" },
        body: '{"etat":"ADMIS"}',
      }),
      contexte("v1", "propositions", "3", "decision"),
    );
    expect(reponse.status).toBe(422);
    expect(reponse.headers.get("content-type")).toBe("application/problem+json");
    expect(await reponse.json()).toMatchObject({ code: "MOTIF_OBLIGATOIRE" });
  });

  it("répond 502 API_INJOIGNABLE si l'API ne répond pas", async () => {
    cookiesRequete[COOKIE_ACCES] = "jeton-a";
    fetchApi.mockRejectedValueOnce(new TypeError("fetch failed"));
    const reponse = await GET(requete("v1/moi"), contexte("v1", "moi"));
    expect(reponse.status).toBe(502);
    expect(await reponse.json()).toMatchObject({ code: "API_INJOIGNABLE" });
  });
});
