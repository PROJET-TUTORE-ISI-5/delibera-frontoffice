import type { Metadata } from "next";

import { EspaceAVenir } from "@/components/espace/espace-a-venir";

export const metadata: Metadata = { title: "Import des données" };

/** M5 – Import : voir le SPEC.md du module dans src/modules/. */
export default function PageImport() {
  return (
    <EspaceAVenir
      titre="Import des données"
      description="Étudiants et inscriptions, maquette, notes de session normale et de rattrapage, acquis antérieurs."
      module="M5 – Import"
      iteration={1}
      cas={[
        { code: "CU03", libelle: "Importer les données" },
        { code: "CU07", libelle: "Saisir les résultats de rattrapage" },
      ]}
      permissions={["DONNEES_IMPORTER", "RATTRAPAGE_SAISIR"]}
      composants={["Stepper", "FileField", "DataGrid", "Checkbox", "Alert"]}
    />
  );
}
