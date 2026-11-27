import "server-only";

import { cookies } from "next/headers";

import { config } from "@/lib/config";

import {
  COOKIE_ACCES,
  COOKIE_CODE_EN_ATTENTE,
  COOKIE_RENOUVELLEMENT,
  cookiesDeSession,
  optionsCookie,
  type JetonsSession,
} from "./cookies";

/** Durée de l'étape « code de double authentification », en secondes. */
const DUREE_CODE_EN_ATTENTE = 5 * 60;

/** Ouvre (ou remplace) la session : à appeler depuis une Server Function, après une connexion réussie. */
export async function ouvrirSession(jetons: JetonsSession): Promise<void> {
  const magasin = await cookies();
  for (const c of cookiesDeSession(jetons, {
    basePath: config.basePath,
    secure: config.cookiesSecurises,
    dureeRenouvellement: config.dureeRenouvellement,
  })) {
    magasin.set(c.name, c.value, c.options);
  }
  magasin.delete({ name: COOKIE_CODE_EN_ATTENTE, path: config.basePath || "/" });
}

/** Ferme la session côté navigateur (la révocation côté API est faite par deconnecter()). */
export async function fermerSession(): Promise<void> {
  const magasin = await cookies();
  for (const nom of [COOKIE_ACCES, COOKIE_RENOUVELLEMENT, COOKIE_CODE_EN_ATTENTE]) {
    magasin.delete({ name: nom, path: config.basePath || "/" });
  }
}

export async function jetonAcces(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_ACCES)?.value;
}

export async function memoriserCodeEnAttente(jetonIntermediaire: string): Promise<void> {
  (await cookies()).set(
    COOKIE_CODE_EN_ATTENTE,
    jetonIntermediaire,
    optionsCookie(config.basePath, config.cookiesSecurises, DUREE_CODE_EN_ATTENTE),
  );
}

export async function lireCodeEnAttente(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_CODE_EN_ATTENTE)?.value;
}
