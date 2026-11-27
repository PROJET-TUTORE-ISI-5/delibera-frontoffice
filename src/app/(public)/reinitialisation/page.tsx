import type { Metadata } from "next";
import { Suspense } from "react";

import { FormulaireNouveauMotDePasse } from "@/components/espace/formulaire-mot-de-passe";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { valeurParametre } from "@/lib/routes";
import { reinitialiser } from "@/modules/securite/actions";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

/** CU18 – Réinitialiser son mot de passe avec le lien reçu. */
export default function PageReinitialisation({ searchParams }: PageProps<"/reinitialisation">) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouveau mot de passe</CardTitle>
        <CardDescription>
          Choisissez votre nouveau mot de passe. Le lien reçu est valable 30 minutes et ne sert
          qu&apos;une fois.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          {searchParams.then(({ jeton }) => (
            <FormulaireNouveauMotDePasse
              action={reinitialiser}
              libelleBouton="Enregistrer"
              jeton={valeurParametre(jeton)}
            />
          ))}
        </Suspense>
      </CardContent>
    </Card>
  );
}
