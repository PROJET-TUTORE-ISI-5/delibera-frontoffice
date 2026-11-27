/**
 * Cookies de session du client web (docs/decisions/0004-bff-jetons-en-cookies.md).
 *
 * Les jetons de l'API ne sont jamais lisibles par le JavaScript du navigateur : ils vivent dans des
 * cookies httpOnly, limités au chemin du client web, et seul le serveur Next.js les envoie à l'API.
 * Ce fichier ne dépend d'aucune API serveur : il est utilisé par proxy.ts, les Route Handlers et les
 * Server Functions.
 */

export const COOKIE_ACCES = "delibera_acces";
export const COOKIE_RENOUVELLEMENT = "delibera_renouvellement";
/** Étape intermédiaire de la double authentification (jeton court remis par l'API). */
export const COOKIE_CODE_EN_ATTENTE = "delibera_code";

/** Marge retirée à la durée du jeton d'accès : le cookie expire avant le jeton. */
export const MARGE_EXPIRATION_S = 30;

/** Jetons d'une session, tels que renvoyés par l'API (record JetonsSession, M1). */
export type JetonsSession = {
  jetonAcces: string;
  jetonRenouvellement: string;
  /** Durée de validité du jeton d'accès, en secondes (900 pour 15 min). */
  expireDans: number;
};

export type OptionsCookie = {
  httpOnly: true;
  sameSite: "strict";
  secure: boolean;
  path: string;
  maxAge: number;
};

export function optionsCookie(basePath: string, secure: boolean, maxAge: number): OptionsCookie {
  return { httpOnly: true, sameSite: "strict", secure, path: basePath || "/", maxAge };
}

/** Cookies à poser pour une session ouverte ou renouvelée. */
export function cookiesDeSession(
  jetons: JetonsSession,
  reglages: { basePath: string; secure: boolean; dureeRenouvellement: number },
): Array<{ name: string; value: string; options: OptionsCookie }> {
  const dureeAcces = Math.max(jetons.expireDans - MARGE_EXPIRATION_S, 1);
  return [
    {
      name: COOKIE_ACCES,
      value: jetons.jetonAcces,
      options: optionsCookie(reglages.basePath, reglages.secure, dureeAcces),
    },
    {
      name: COOKIE_RENOUVELLEMENT,
      value: jetons.jetonRenouvellement,
      options: optionsCookie(reglages.basePath, reglages.secure, reglages.dureeRenouvellement),
    },
  ];
}

/** Valide la forme d'une réponse de l'API avant d'en faire des cookies. */
export function estJetonsSession(valeur: unknown): valeur is JetonsSession {
  if (typeof valeur !== "object" || valeur === null) return false;
  const v = valeur as Record<string, unknown>;
  return (
    typeof v.jetonAcces === "string" &&
    v.jetonAcces.length > 0 &&
    typeof v.jetonRenouvellement === "string" &&
    v.jetonRenouvellement.length > 0 &&
    typeof v.expireDans === "number" &&
    v.expireDans > 0
  );
}

/** En-tête Cookie d'une requête, avec certains cookies remplacés (après un renouvellement). */
export function remplacerCookies(
  existants: Array<{ name: string; value: string }>,
  nouveaux: Record<string, string>,
): string {
  const conserves = existants.filter((c) => !(c.name in nouveaux));
  return [...conserves, ...Object.entries(nouveaux).map(([name, value]) => ({ name, value }))]
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}
