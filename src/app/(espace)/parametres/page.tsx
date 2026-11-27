import type { Metadata } from "next";

import { EspaceAVenir } from "@/components/espace/espace-a-venir";

export const metadata: Metadata = { title: "Paramètres de délibération" };

/** M4 – Règles et paramètres : voir le SPEC.md du module dans src/modules/. */
export default function PageParametres() {
  return (
    <EspaceAVenir
      titre="Paramètres de délibération"
      description="Crédits, note de validation, note éliminatoire, rattrapage, délai de réclamation, par école, cycle ou niveau."
      module="M4 – Règles et paramètres"
      iteration={2}
      cas={[{ code: "CU13", libelle: "Gérer les paramètres de délibération" }]}
      permissions={["PARAM_GERER"]}
      composants={["SettingsPanel", "Switch", "Slider", "DatePicker"]}
    />
  );
}
