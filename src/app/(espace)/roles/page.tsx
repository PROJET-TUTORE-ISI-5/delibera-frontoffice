import type { Metadata } from "next";

import { EspaceAVenir } from "@/components/espace/espace-a-venir";

export const metadata: Metadata = { title: "Rôles et permissions" };

/** M1 – Sécurité et accès : voir le SPEC.md du module dans src/modules/. */
export default function PageRoles() {
  return (
    <EspaceAVenir
      titre="Rôles et permissions"
      description="Rôles prédéfinis (lecture seule, duplicables) et rôles personnalisés de l'école."
      module="M1 – Sécurité et accès"
      iteration={1}
      cas={[{ code: "CU16", libelle: "Gérer les rôles et les permissions" }]}
      permissions={["ROLE_GERER"]}
      composants={["DataGrid", "CheckboxTree", "Dialog"]}
    />
  );
}
