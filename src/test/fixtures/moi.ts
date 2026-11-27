import type { Moi } from "@/modules/securite/types";

/**
 * Utilisateur fictif pour les tests (AGENT.md, section 8.2 : données fictives uniquement).
 *   fabriquerMoi({ permissions: ["AUDIT_CONSULTER"] })
 */
export function fabriquerMoi(surcharge: Partial<Moi> = {}): Moi {
  return {
    id: 1,
    nom: "Exemple",
    prenom: "Awa",
    email: "awa.exemple@ecole-fictive.cm",
    ecole: { id: 1, code: "EF", nom: "École fictive", fuseauHoraire: "Africa/Douala" },
    permissions: ["DOSSIER_CONSULTER"],
    affectations: [{ role: "Gestionnaire académique", typePerimetre: "ECOLE" }],
    jurys: [],
    doitChangerMotDePasse: false,
    ...surcharge,
  };
}
