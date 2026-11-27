import type { Metadata } from "next";

import { EspaceAVenir } from "@/components/espace/espace-a-venir";

export const metadata: Metadata = { title: "Utilisateurs" };

/** M1 – Sécurité et accès : voir le SPEC.md du module dans src/modules/. */
export default function PageUtilisateurs() {
  return (
    <EspaceAVenir
      titre="Utilisateurs"
      description="Comptes de l'école, rôles affectés avec leur périmètre et leur période, activation par lien."
      module="M1 – Sécurité et accès"
      iteration={1}
      cas={[{ code: "CU12", libelle: "Gérer les utilisateurs" }]}
      permissions={["UTILISATEUR_GERER"]}
      composants={["DataGrid", "Combobox", "Dialog", "DropdownMenu"]}
    />
  );
}
