import type { Metadata } from "next";

import { EspaceAVenir } from "@/components/espace/espace-a-venir";

export const metadata: Metadata = { title: "Écoles clientes" };

/** M2 – Écoles clientes : voir le SPEC.md du module dans src/modules/. */
export default function PageEcoles() {
  return (
    <EspaceAVenir
      titre="Écoles clientes"
      description="Création, suspension et réactivation des écoles et de leur premier administrateur."
      module="M2 – Écoles clientes"
      iteration={1}
      cas={[{ code: "CU15", libelle: "Gérer les écoles clientes" }]}
      permissions={["ECOLE_GERER"]}
      composants={["Tabs", "StatCard", "Chart", "DataGrid"]}
    />
  );
}
