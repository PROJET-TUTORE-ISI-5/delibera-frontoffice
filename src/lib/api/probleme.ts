/**
 * Erreurs de l'API au format RFC 9457 (application/problem+json), produites par GestionnaireErreurs
 * dans delibera-core-api. Le client s'appuie toujours sur `code`, jamais sur le texte du message.
 */

export type Violation = {
  champ: string;
  message: string;
};

export type ProblemDetail = {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  instance?: string;
  /** Code d'erreur métier stable : MOTIF_OBLIGATOIRE, MODIFICATION_CONCURRENTE… */
  code?: string;
  /** Erreurs de validation champ par champ (400). */
  violations?: Violation[];
  [extension: string]: unknown;
};

/** Codes produits par le client web lui-même (relais, réseau). */
export const CODES_CLIENT = {
  API_INJOIGNABLE: "API_INJOIGNABLE",
  SESSION_EXPIREE: "SESSION_EXPIREE",
  REPONSE_INVALIDE: "REPONSE_INVALIDE",
  ORIGINE_REFUSEE: "ORIGINE_REFUSEE",
} as const;

const MESSAGES_PAR_STATUT: Record<number, string> = {
  400: "Certaines informations sont invalides.",
  401: "Votre session a expiré. Reconnectez-vous.",
  403: "Vous n'avez pas les droits nécessaires pour cette action.",
  404: "L'élément demandé est introuvable.",
  409: "Le dossier a été modifié par quelqu'un d'autre. Il a été rechargé : vérifiez puis recommencez.",
  422: "L'opération n'est pas permise dans l'état actuel.",
  502: "Le serveur de la plateforme est injoignable. Réessayez dans un instant.",
};

export class ErreurApi extends Error {
  readonly status: number;
  readonly code?: string;
  readonly probleme: ProblemDetail;

  constructor(probleme: ProblemDetail) {
    super(probleme.detail ?? probleme.title ?? MESSAGES_PAR_STATUT[probleme.status] ?? "Erreur inattendue.");
    this.name = "ErreurApi";
    this.status = probleme.status;
    this.code = probleme.code;
    this.probleme = probleme;
  }

  /** Message à afficher à l'utilisateur (en français, sans détail technique). */
  get messageUtilisateur(): string {
    return this.probleme.detail ?? MESSAGES_PAR_STATUT[this.status] ?? "Une erreur inattendue est survenue.";
  }

  /** Erreurs de validation indexées par champ, pour React Hook Form. */
  get erreursParChamp(): Record<string, string> {
    return Object.fromEntries((this.probleme.violations ?? []).map((v) => [v.champ, v.message]));
  }

  get estConflit(): boolean {
    return this.status === 409;
  }

  get estSessionExpiree(): boolean {
    return this.status === 401;
  }
}

export function estErreurApi(erreur: unknown): erreur is ErreurApi {
  return erreur instanceof ErreurApi;
}

/** Construit une ErreurApi à partir d'une réponse HTTP en échec, quel que soit son format. */
export async function erreurDepuisReponse(reponse: Response): Promise<ErreurApi> {
  const type = reponse.headers.get("content-type") ?? "";
  if (type.includes("json")) {
    try {
      const corps = (await reponse.json()) as Partial<ProblemDetail>;
      return new ErreurApi({ ...corps, status: corps.status ?? reponse.status });
    } catch {
      // corps illisible : on retombe sur le statut seul
    }
  }
  return new ErreurApi({ status: reponse.status, title: reponse.statusText || undefined });
}

/** Réponse problem+json produite par le client web (relais, erreurs réseau). */
export function reponseProbleme(probleme: ProblemDetail): Response {
  return Response.json(probleme, {
    status: probleme.status,
    headers: { "content-type": "application/problem+json" },
  });
}
