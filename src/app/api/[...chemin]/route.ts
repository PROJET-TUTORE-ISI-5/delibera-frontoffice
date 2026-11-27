import { cookies } from "next/headers";
import { type NextRequest } from "next/server";

import { config } from "@/lib/config";
import { CODES_CLIENT, reponseProbleme } from "@/lib/api/probleme";
import {
  COOKIE_ACCES,
  COOKIE_RENOUVELLEMENT,
  cookiesDeSession,
} from "@/lib/session/cookies";
import { renouvelerJetons } from "@/lib/session/renouvellement";

/**
 * Relais du navigateur vers l'API (« backend for frontend »).
 *   navigateur -> /app/api/v1/<chemin> -> ce Route Handler -> DELIBERA_API_URL/api/v1/<chemin>
 *
 * Il ajoute le jeton d'accès tiré du cookie httpOnly, renouvelle la session si besoin, et renvoie
 * la réponse de l'API telle quelle (statut, JSON, fichiers PDF/XLSX en flux).
 * Règles (docs/architecture.md, « Relais ») :
 *  - seules les routes /v1/… sont relayées, jamais /v1/auth/… (réservées aux Server Functions) ;
 *  - une requête qui modifie (POST, PUT, PATCH, DELETE) doit venir du client web lui-même ;
 *  - seuls quelques en-têtes passent, dans un sens comme dans l'autre.
 */

const EN_TETES_REQUETE = ["accept", "content-type", "accept-language", "if-match", "if-none-match"];
const EN_TETES_REPONSE = [
  "content-type",
  "content-disposition",
  "content-length",
  "cache-control",
  "etag",
  "last-modified",
];
const SEGMENT_VALIDE = /^[A-Za-z0-9._~-]+$/;

type Contexte = { params: Promise<{ chemin: string[] }> };

async function relayer(request: NextRequest, { params }: Contexte): Promise<Response> {
  const { chemin } = await params;

  if (chemin[0] !== "v1" || chemin[1] === "auth" || !chemin.every((s) => SEGMENT_VALIDE.test(s) && s !== "." && s !== "..")) {
    return reponseProbleme({ status: 404, title: "Route inconnue" });
  }

  if (!["GET", "HEAD"].includes(request.method) && !estMemeOrigine(request)) {
    return reponseProbleme({
      status: 403,
      code: CODES_CLIENT.ORIGINE_REFUSEE,
      title: "Requête refusée",
      detail: "Cette requête ne provient pas du client web Delibera.",
    });
  }

  const magasin = await cookies();
  let jeton = magasin.get(COOKIE_ACCES)?.value;
  const renouvellement = magasin.get(COOKIE_RENOUVELLEMENT)?.value;
  let nouveauxCookies: ReturnType<typeof cookiesDeSession> = [];

  if (!jeton && renouvellement && !config.sessionFictive) {
    const jetons = await renouvelerJetons(config.apiUrl, renouvellement, config.delaiApi);
    if (jetons) {
      jeton = jetons.jetonAcces;
      nouveauxCookies = cookiesDeSession(jetons, {
        basePath: config.basePath,
        secure: config.cookiesSecurises,
        dureeRenouvellement: config.dureeRenouvellement,
      });
    }
  }

  if (!jeton && !config.sessionFictive) {
    return reponseProbleme({
      status: 401,
      code: CODES_CLIENT.SESSION_EXPIREE,
      title: "Session expirée",
      detail: "Votre session a expiré. Reconnectez-vous.",
    });
  }

  const cible = new URL(`${config.apiUrl}/api/${chemin.join("/")}`);
  cible.search = request.nextUrl.search;

  const enTetes = new Headers();
  for (const nom of EN_TETES_REQUETE) {
    const valeur = request.headers.get(nom);
    if (valeur) enTetes.set(nom, valeur);
  }
  if (jeton) enTetes.set("authorization", `Bearer ${jeton}`);
  const ip = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for");
  if (ip) enTetes.set("x-forwarded-for", ip);

  let amont: Response;
  try {
    const avecCorps = !["GET", "HEAD"].includes(request.method);
    amont = await fetch(cible, {
      method: request.method,
      headers: enTetes,
      body: avecCorps ? request.body : undefined,
      // Le corps (fichiers d'import jusqu'à 10 Mo) est transmis en flux, sans être chargé en mémoire.
      ...(avecCorps ? { duplex: "half" } : {}),
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(config.delaiApi * 4),
    } as RequestInit);
  } catch {
    return reponseProbleme({
      status: 502,
      code: CODES_CLIENT.API_INJOIGNABLE,
      title: "API injoignable",
      detail: "Le serveur de la plateforme ne répond pas. Réessayez dans un instant.",
    });
  }

  const enTetesReponse = new Headers();
  for (const nom of EN_TETES_REPONSE) {
    const valeur = amont.headers.get(nom);
    if (valeur) enTetesReponse.set(nom, valeur);
  }
  const reponse = new Response(amont.body, { status: amont.status, headers: enTetesReponse });
  for (const c of nouveauxCookies) {
    reponse.headers.append("set-cookie", serialiserCookie(c.name, c.value, c.options));
  }
  return reponse;
}

/** Protection contre les requêtes forgées depuis un autre site (CSRF), en plus de SameSite=Strict. */
function estMemeOrigine(request: NextRequest): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const origine = request.headers.get("origin");
  if (!origine) return false;
  const hote = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origine).host === hote;
  } catch {
    return false;
  }
}

function serialiserCookie(
  nom: string,
  valeur: string,
  o: { path: string; maxAge: number; secure: boolean; httpOnly: boolean; sameSite: string },
): string {
  const parties = [`${nom}=${valeur}`, `Path=${o.path}`, `Max-Age=${o.maxAge}`, "SameSite=Strict"];
  if (o.httpOnly) parties.push("HttpOnly");
  if (o.secure) parties.push("Secure");
  return parties.join("; ");
}

export const GET = relayer;
export const POST = relayer;
export const PUT = relayer;
export const PATCH = relayer;
export const DELETE = relayer;
