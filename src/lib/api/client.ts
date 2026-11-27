import { CODES_CLIENT, erreurDepuisReponse, ErreurApi } from "./probleme";

/**
 * Appels à l'API depuis le navigateur (Client Components, TanStack Query).
 * Ils passent par le relais du client web (/app/api/v1/…), qui ajoute le jeton de session : le
 * navigateur ne voit jamais les jetons (docs/decisions/0004-bff-jetons-en-cookies.md).
 *
 *   const situations = await api.get<Page<Situation>>("/deliberations/12/situations", { etat: "A_DELIBERER" });
 *   await api.post("/propositions/34/decision", { etat: "ADMIS", motif, verrou });
 */

const BASE = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/v1`;

type Parametres = Record<string, string | number | boolean | undefined | null>;

function construireUrl(chemin: string, parametres?: Parametres): string {
  const recherche = new URLSearchParams();
  for (const [cle, valeur] of Object.entries(parametres ?? {})) {
    if (valeur !== undefined && valeur !== null && valeur !== "") recherche.set(cle, String(valeur));
  }
  const suffixe = recherche.size > 0 ? `?${recherche}` : "";
  return `${BASE}${chemin}${suffixe}`;
}

async function envoyer<T>(methode: string, chemin: string, corps?: unknown, parametres?: Parametres): Promise<T> {
  const estFormulaire = typeof FormData !== "undefined" && corps instanceof FormData;
  let reponse: Response;
  try {
    reponse = await fetch(construireUrl(chemin, parametres), {
      method: methode,
      credentials: "same-origin",
      headers: {
        accept: "application/json",
        ...(corps !== undefined && !estFormulaire ? { "content-type": "application/json" } : {}),
      },
      body: corps === undefined ? undefined : estFormulaire ? corps : JSON.stringify(corps),
    });
  } catch {
    throw new ErreurApi({ status: 502, code: CODES_CLIENT.API_INJOIGNABLE, title: "Réseau indisponible" });
  }
  if (!reponse.ok) {
    const erreur = await erreurDepuisReponse(reponse);
    if (erreur.estSessionExpiree && typeof window !== "undefined") {
      // Session expirée : retour à la connexion, puis à la page en cours.
      const suite = window.location.pathname.replace(process.env.NEXT_PUBLIC_BASE_PATH ?? "", "") || "/";
      window.location.assign(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/connexion?suite=${encodeURIComponent(suite)}`);
    }
    throw erreur;
  }
  if (reponse.status === 204) return undefined as T;
  const type = reponse.headers.get("content-type") ?? "";
  return (type.includes("json") ? await reponse.json() : await reponse.blob()) as T;
}

export const api = {
  get: <T>(chemin: `/${string}`, parametres?: Parametres) => envoyer<T>("GET", chemin, undefined, parametres),
  post: <T>(chemin: `/${string}`, corps?: unknown) => envoyer<T>("POST", chemin, corps),
  put: <T>(chemin: `/${string}`, corps?: unknown) => envoyer<T>("PUT", chemin, corps),
  patch: <T>(chemin: `/${string}`, corps?: unknown) => envoyer<T>("PATCH", chemin, corps),
  delete: <T>(chemin: `/${string}`) => envoyer<T>("DELETE", chemin),
  /** Téléversement (import de fichiers, M5) : le navigateur fixe lui-même l'en-tête multipart. */
  televerser: <T>(chemin: `/${string}`, formulaire: FormData) => envoyer<T>("POST", chemin, formulaire),
  /** Adresse d'un fichier à télécharger (PV, listes, exports) : à mettre dans un lien <a href>. */
  url: (chemin: `/${string}`, parametres?: Parametres) => construireUrl(chemin, parametres),
};

/** Page renvoyée par les listes paginées de l'API (Pageable de Spring Data). */
export type Page<T> = {
  content: T[];
  page: { size: number; number: number; totalElements: number; totalPages: number };
};
