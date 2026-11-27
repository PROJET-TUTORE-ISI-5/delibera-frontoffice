import type { DesignationJury } from "@/lib/permissions";
import type { JetonsSession } from "@/lib/session/cookies";

/**
 * Contrat attendu des routes /api/v1/auth/** et /api/v1/moi de delibera-core-api (M1).
 * Ces routes sont encore des [Proposition] du SPEC.md de l'API : tout changement de leur côté se
 * reporte ici et dans modules/securite/SPEC.md, section « Contrat de l'API ».
 */

/** Réponse de POST /auth/connexion (record ResultatConnexion). */
export type ResultatConnexion = {
  /** Vrai si l'école exige un code TOTP : la session n'est ouverte qu'après POST /auth/code. */
  doubleAuthentificationRequise: boolean;
  /** Vrai à la première connexion : le mot de passe doit être changé avant toute autre action. */
  doitChangerMotDePasse: boolean;
  /** Présents si la session est ouverte. */
  jetons?: JetonsSession;
  /** Jeton court qui relie l'étape du code à la connexion (si doubleAuthentificationRequise). */
  jetonIntermediaire?: string;
};

export type EcoleCourante = {
  id: number;
  code: string;
  nom: string;
  /** Identifiant IANA (Africa/Douala) : sert à afficher les dates. */
  fuseauHoraire: string;
};

export type AffectationResume = {
  role: string;
  typePerimetre: "ECOLE" | "CYCLE" | "NIVEAU";
  perimetre?: string;
};

/** Réponse de GET /moi : profil, permissions et jurys, pour adapter le menu. */
export type Moi = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  /** Absent pour l'administrateur de la plateforme, qui n'appartient à aucune école. */
  ecole?: EcoleCourante;
  /** Codes de permission accordés par les rôles valides aujourd'hui (hors droits de jury). */
  permissions: string[];
  affectations: AffectationResume[];
  /** Délibérations où l'utilisateur est désigné, avec sa qualité (CU17). */
  jurys: DesignationJury[];
  doitChangerMotDePasse: boolean;
};

/** Utilisateur fictif de DELIBERA_SESSION_FICTIVE (développement seulement). */
export const MOI_FICTIF: Moi = {
  id: 0,
  nom: "Exemple",
  prenom: "Session",
  email: "session.fictive@exemple.cm",
  ecole: { id: 0, code: "ECO", nom: "École d'exemple", fuseauHoraire: "Africa/Douala" },
  permissions: [
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
    "PV_GENERER",
    "RECLAMATION_TRAITER",
    "STATS_CONSULTER",
    "AUDIT_CONSULTER",
  ],
  affectations: [{ role: "Gestionnaire académique", typePerimetre: "ECOLE" }],
  jurys: [{ deliberationId: 1, qualite: "PRESIDENT" }],
  doitChangerMotDePasse: false,
};

/** Libellé du rôle principal, affiché sous le nom dans la barre supérieure. */
export function libelleRole(moi: Moi): string {
  if (!moi.ecole) return "Administrateur de la plateforme";
  return moi.affectations[0]?.role ?? (moi.jurys.length > 0 ? "Membre du jury" : "Utilisateur");
}
