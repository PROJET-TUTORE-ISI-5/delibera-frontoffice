/**
 * Codes de permission de la plateforme (cahier d'analyse §3.5, SecuriteConfig de l'API).
 * Ils servent seulement à adapter l'interface : l'API vérifie chaque requête (algorithme A8).
 */
export const PERMISSIONS = [
  "ECOLE_GERER",
  "REFERENTIEL_GERER",
  "REGLE_GERER",
  "PARAM_GERER",
  "UTILISATEUR_GERER",
  "ROLE_GERER",
  "JURY_CONSTITUER",
  "DONNEES_IMPORTER",
  "PREDELIB_LANCER",
  "RATTRAPAGE_SAISIR",
  "DOSSIER_CONSULTER",
  "DOSSIER_STATUER",
  "DELIB_VALIDER",
  "PV_GENERER",
  "RECLAMATION_TRAITER",
  "REOUVERTURE_AUTORISER",
  "STATS_CONSULTER",
  "AUDIT_CONSULTER",
] as const;

export type CodePermission = (typeof PERMISSIONS)[number];

export type QualiteJury = "PRESIDENT" | "MEMBRE";

/** Droits d'un membre du jury, valables seulement pour SA délibération (A8, CU17). */
export const PERMISSIONS_JURY: Record<QualiteJury, readonly CodePermission[]> = {
  MEMBRE: ["DOSSIER_CONSULTER", "DOSSIER_STATUER"],
  PRESIDENT: [
    "DOSSIER_CONSULTER",
    "DOSSIER_STATUER",
    "DELIB_VALIDER",
    "PV_GENERER",
    "REOUVERTURE_AUTORISER",
  ],
};

export type DesignationJury = { deliberationId: number; qualite: QualiteJury };

/** Ce dont l'interface a besoin pour décider quoi afficher. */
export type Habilitations = {
  permissions: readonly string[];
  jurys: readonly DesignationJury[];
};

/** Vrai si l'une des permissions est accordée par un rôle (hors droits de jury). */
export function aUneDesPermissions(h: Habilitations, codes: readonly CodePermission[]): boolean {
  return codes.some((c) => h.permissions.includes(c));
}

/** Vrai si la permission est accordée par un rôle, ou par le jury de cette délibération. */
export function peutSurDeliberation(
  h: Habilitations,
  code: CodePermission,
  deliberationId: number,
): boolean {
  if (h.permissions.includes(code)) return true;
  return h.jurys.some(
    (j) => j.deliberationId === deliberationId && PERMISSIONS_JURY[j.qualite].includes(code),
  );
}

/** Vrai si l'utilisateur siège dans au moins un jury. */
export function estDansUnJury(h: Habilitations): boolean {
  return h.jurys.length > 0;
}
