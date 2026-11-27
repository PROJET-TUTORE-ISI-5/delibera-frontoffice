import type { Metadata } from "next";

import { EspaceAVenir } from "@/components/espace/espace-a-venir";

export const metadata: Metadata = { title: "Journal d'audit" };

/** M9 – Audit : voir le SPEC.md du module dans src/modules/. */
export default function PageAudit() {
  return (
    <EspaceAVenir
      titre="Journal d'audit"
      description="Modifications, connexions et refus d'accès de l'école, en lecture seule."
      module="M9 – Audit"
      iteration={4}
      cas={[{ code: "CU11", libelle: "Consulter le journal d'audit" }]}
      permissions={["AUDIT_CONSULTER"]}
      composants={["Timeline", "DataGrid", "DatePicker", "SearchHighlight"]}
    />
  );
}
