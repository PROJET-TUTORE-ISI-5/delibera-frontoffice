/**
 * Configuration lue côté serveur (variables d'environnement du conteneur), utilisée par proxy.ts,
 * les Route Handlers et les Server Components. Modèle : .env.example.
 * Seules les variables NEXT_PUBLIC_* atteignent le navigateur : n'en ajoutez pas sans raison.
 */

function booleen(valeur: string | undefined, parDefaut: boolean): boolean {
  if (valeur === undefined || valeur === "") return parDefaut;
  return valeur === "true" || valeur === "1";
}

function entier(valeur: string | undefined, parDefaut: number): number {
  const n = Number.parseInt(valeur ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : parDefaut;
}

export const config = {
  /** Adresse de l'API vue depuis le serveur Next.js (sans /api/v1). */
  apiUrl: (process.env.DELIBERA_API_URL ?? "http://127.0.0.1:8080").replace(/\/$/, ""),
  /** Chemin du client web (identique à basePath dans next.config.ts). */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "/app",
  /** Cookies « Secure » : à mettre à true dès que le site est servi en HTTPS. */
  cookiesSecurises: booleen(process.env.DELIBERA_COOKIES_SECURISES, false),
  /** Durée maximale du cookie du jeton de renouvellement, en secondes (l'API reste seule juge). */
  dureeRenouvellement: entier(process.env.DELIBERA_DUREE_RENOUVELLEMENT, 8 * 3600),
  /** Délai maximal d'un appel à l'API, en millisecondes. */
  delaiApi: entier(process.env.DELIBERA_DELAI_API_MS, 30_000),
  /**
   * Session fictive pour développer les écrans avant que l'API d'authentification existe.
   * Ignorée en production, quelle que soit sa valeur (AGENT.md, section 6).
   */
  sessionFictive:
    process.env.NODE_ENV !== "production" && booleen(process.env.DELIBERA_SESSION_FICTIVE, false),
  version: process.env.NEXT_PUBLIC_DELIBERA_VERSION ?? "dev",
} as const;
