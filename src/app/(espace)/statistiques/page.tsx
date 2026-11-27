import type { Metadata } from "next";

import { EspaceAVenir } from "@/components/espace/espace-a-venir";

export const metadata: Metadata = { title: "Statistiques" };

/** M8 – Documents et statistiques : voir le SPEC.md du module dans src/modules/. */
export default function PageStatistiques() {
  return (
    <EspaceAVenir
      titre="Statistiques"
      description="Taux d'admission et répartition des résultats par niveau, filière et année, avec export XLSX."
      module="M8 – Documents et statistiques"
      iteration={4}
      cas={[
        { code: "CU09", libelle: "Générer le PV et les listes" },
        { code: "CU10", libelle: "Consulter les statistiques" },
      ]}
      permissions={["STATS_CONSULTER"]}
      composants={["StatCard", "Chart", "DataGrid", "SelectMenu"]}
    />
  );
}
