/**
 * Chemins du client web, sans le basePath (/app) : Next.js l'ajoute lui-même aux liens et aux
 * redirections. Les libellés des URL sont en français, comme le vocabulaire des cahiers.
 */
export const ROUTES = {
  accueil: "/",
  connexion: "/connexion",
  codeConnexion: "/connexion/code",
  motDePasseOublie: "/mot-de-passe-oublie",
  reinitialisation: "/reinitialisation",
  activation: "/activation",
  changerMotDePasse: "/mon-compte/mot-de-passe",
  deliberations: "/deliberations",
  importation: "/import",
  referentiel: "/referentiel",
  regles: "/regles",
  parametres: "/parametres",
  statistiques: "/statistiques",
  audit: "/audit",
  utilisateurs: "/utilisateurs",
  roles: "/roles",
  ecoles: "/plateforme/ecoles",
} as const;

/** Pages accessibles sans session (CU00, CU18, activation d'un compte CU12). */
export const ROUTES_PUBLIQUES: readonly string[] = [
  ROUTES.connexion,
  ROUTES.codeConnexion,
  ROUTES.motDePasseOublie,
  ROUTES.reinitialisation,
  ROUTES.activation,
];

export function estRoutePublique(chemin: string): boolean {
  return ROUTES_PUBLIQUES.some((r) => chemin === r || chemin.startsWith(`${r}/`));
}

/**
 * Adresse de retour après connexion (?suite=…). N'accepte qu'un chemin interne au client web,
 * pour qu'un lien piégé ne puisse pas renvoyer l'utilisateur vers un autre site.
 */
export function suiteSure(suite: string | null | undefined): string {
  if (!suite || !suite.startsWith("/") || suite.startsWith("//") || suite.includes("\\")) {
    return ROUTES.accueil;
  }
  if (estRoutePublique(suite.split("?")[0] ?? "")) return ROUTES.accueil;
  return suite;
}

/** Première valeur d'un paramètre d'adresse (`?suite=…`, `?jeton=…`) ; chaîne vide s'il manque. */
export function valeurParametre(valeur: string | string[] | undefined): string {
  return (Array.isArray(valeur) ? valeur[0] : valeur) ?? "";
}
