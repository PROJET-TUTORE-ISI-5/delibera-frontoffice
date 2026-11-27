import type { Metadata } from "next";

import { EspaceAVenir } from "@/components/espace/espace-a-venir";

export const metadata: Metadata = { title: "Règles de passage" };

/** M4 – Règles et paramètres : voir le SPEC.md du module dans src/modules/. */
export default function PageRegles() {
  return (
    <EspaceAVenir
      titre="Règles de passage"
      description="Règles versionnées par niveau, filière ou spécialité : conditions, combinaison ET/OU, seuils limites."
      module="M4 – Règles et paramètres"
      iteration={2}
      cas={[
        { code: "CU02", libelle: "Gérer les règles de passage" },
      ]}
      permissions={["REGLE_GERER"]}
      composants={["Combobox", "ToggleGroup", "Select", "Switch", "Button (dashed)", "Card", "Badge"]}
    />
  );
}
