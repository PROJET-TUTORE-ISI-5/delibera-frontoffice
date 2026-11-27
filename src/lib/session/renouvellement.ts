import { estJetonsSession, type JetonsSession } from "./cookies";

/**
 * Renouvelle la session auprès de l'API avec le jeton de renouvellement (CU00, BNF05).
 * Utilisé par proxy.ts (navigation) et par le relais /api (appels du navigateur).
 * Renvoie null si l'API refuse (session expirée, révoquée, inactive depuis plus de 30 min).
 *
 * Contrat attendu : POST /api/v1/auth/renouvellement { jetonRenouvellement } -> JetonsSession
 * (modules/securite/SPEC.md, section « Contrat de l'API »).
 */
export async function renouvelerJetons(
  apiUrl: string,
  jetonRenouvellement: string,
  delaiMs: number,
): Promise<JetonsSession | null> {
  try {
    const reponse = await fetch(`${apiUrl}/api/v1/auth/renouvellement`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ jetonRenouvellement }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(delaiMs),
    });
    if (!reponse.ok) return null;
    const corps: unknown = await reponse.json();
    return estJetonsSession(corps) ? corps : null;
  } catch {
    return null;
  }
}
