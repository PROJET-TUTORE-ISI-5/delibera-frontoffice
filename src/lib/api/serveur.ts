import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { config } from "@/lib/config";
import { ROUTES } from "@/lib/routes";
import { COOKIE_ACCES } from "@/lib/session/cookies";

import { CODES_CLIENT, erreurDepuisReponse, ErreurApi, estErreurApi } from "./probleme";

type Methode = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type OptionsAppel = {
  methode?: Methode;
  /** Corps JSON de la requête. */
  corps?: unknown;
  /** Paramètres de requête (?anneeId=…) ; les valeurs vides sont ignorées. */
  parametres?: Record<string, string | number | boolean | undefined | null>;
  /**
   * Jeton d'accès à utiliser. Par défaut, celui du cookie de session.
   * `null` pour une route publique (/auth/…).
   */
  jeton?: string | null;
};

/**
 * Appelle l'API Delibera depuis le serveur Next.js (Server Components, Server Functions, Route
 * Handlers). Le chemin est relatif à /api/v1 : appelerApi("/deliberations/12").
 * Lève une ErreurApi (RFC 9457) pour toute réponse en échec.
 */
export async function appelerApi<T>(chemin: `/${string}`, options: OptionsAppel = {}): Promise<T> {
  const jeton =
    options.jeton !== undefined ? options.jeton : (await cookies()).get(COOKIE_ACCES)?.value;

  const url = new URL(`${config.apiUrl}/api/v1${chemin}`);
  for (const [cle, valeur] of Object.entries(options.parametres ?? {})) {
    if (valeur !== undefined && valeur !== null && valeur !== "") url.searchParams.set(cle, String(valeur));
  }

  const enTetes: Record<string, string> = { accept: "application/json" };
  if (jeton) enTetes.authorization = `Bearer ${jeton}`;
  if (options.corps !== undefined) enTetes["content-type"] = "application/json";

  let reponse: Response;
  try {
    reponse = await fetch(url, {
      method: options.methode ?? "GET",
      headers: enTetes,
      body: options.corps !== undefined ? JSON.stringify(options.corps) : undefined,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(config.delaiApi),
    });
  } catch {
    throw new ErreurApi({
      status: 502,
      code: CODES_CLIENT.API_INJOIGNABLE,
      title: "API injoignable",
    });
  }

  if (!reponse.ok) throw await erreurDepuisReponse(reponse);
  if (reponse.status === 204 || reponse.headers.get("content-length") === "0") return undefined as T;
  try {
    return (await reponse.json()) as T;
  } catch {
    throw new ErreurApi({ status: 502, code: CODES_CLIENT.REPONSE_INVALIDE, title: "Réponse illisible" });
  }
}

/**
 * Lecture pour un Server Component : une session expirée (401) renvoie vers la page de connexion.
 * Les autres erreurs remontent jusqu'au error.tsx le plus proche.
 */
export async function lireApi<T>(chemin: `/${string}`, options: OptionsAppel = {}): Promise<T> {
  try {
    return await appelerApi<T>(chemin, options);
  } catch (erreur) {
    if (estErreurApi(erreur) && erreur.estSessionExpiree) redirect(ROUTES.connexion);
    throw erreur;
  }
}
