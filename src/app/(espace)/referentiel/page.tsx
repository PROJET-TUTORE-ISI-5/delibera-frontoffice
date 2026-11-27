import type { Metadata } from "next";

import { EspaceAVenir } from "@/components/espace/espace-a-venir";

export const metadata: Metadata = { title: "Référentiel académique" };

/** M3 – Référentiel et maquettes : voir le SPEC.md du module dans src/modules/. */
export default function PageReferentiel() {
  return (
    <EspaceAVenir
      titre="Référentiel académique"
      description="Années, semestres, cycles, filières et niveaux couverts, spécialités, classes, UE, EC et maquettes."
      module="M3 – Référentiel et maquettes"
      iteration={1}
      cas={[
        { code: "CU01", libelle: "Paramétrer le référentiel académique" },
      ]}
      permissions={["REFERENTIEL_GERER"]}
      composants={["Tabs", "DataGrid", "Dialog", "Combobox", "Field"]}
    />
  );
}
