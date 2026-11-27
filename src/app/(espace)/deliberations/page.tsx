import type { Metadata } from "next";

import { EspaceAVenir } from "@/components/espace/espace-a-venir";

export const metadata: Metadata = { title: "Délibérations" };

/** M7 – Délibération et jury : voir le SPEC.md du module dans src/modules/. */
export default function PageDeliberations() {
  return (
    <EspaceAVenir
      titre="Délibérations"
      description="Création, pré-délibération, séance du jury, clôture, PV et réclamations."
      module="M7 – Délibération et jury"
      iteration={3}
      cas={[
        { code: "CU04", libelle: "Créer la délibération et lancer la pré-délibération" },
        { code: "CU17", libelle: "Constituer le jury" },
        { code: "CU05", libelle: "Examiner les cas critiques" },
        { code: "CU06", libelle: "Statuer sur un dossier, relever une note" },
        { code: "CU08", libelle: "Valider et clôturer" },
        { code: "CU14", libelle: "Traiter une réclamation" },
      ]}
      permissions={["DOSSIER_CONSULTER", "PREDELIB_LANCER", "JURY_CONSTITUER"]}
      jury
      composants={["AppShell", "PageHeader", "FilterBar", "SelectMenu", "StatCard", "DataGrid", "DecisionBadge", "Sheet", "CreditGauge", "DecisionRadioGroup", "MultiSelect", "ConfirmButton"]}
    />
  );
}
