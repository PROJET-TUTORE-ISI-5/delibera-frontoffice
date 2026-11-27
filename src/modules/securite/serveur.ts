import "server-only";

import { cache } from "react";

import { lireApi } from "@/lib/api/serveur";
import { config } from "@/lib/config";

import { MOI_FICTIF, type Moi } from "./types";

/**
 * Utilisateur connecté : profil, école, permissions et jurys (GET /api/v1/moi).
 * Une seule lecture par requête, quel que soit le nombre de composants qui l'appellent.
 * À appeler sous une frontière <Suspense> (lecture de cookies, Cache Components).
 */
export const lireMoi = cache(async (): Promise<Moi> => {
  if (config.sessionFictive) return MOI_FICTIF;
  return lireApi<Moi>("/moi");
});
