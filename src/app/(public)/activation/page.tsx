import type { Metadata } from "next";
import { Suspense } from "react";

import { FormulaireNouveauMotDePasse } from "@/components/espace/formulaire-mot-de-passe";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { activer } from "@/modules/securite/actions";

export const metadata: Metadata = { title: "Activer votre compte" };

/** CU12 – Activation d'un compte créé par l'administrateur de l'école. */
export default function PageActivation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activer votre compte</CardTitle>
        <CardDescription>Choisissez le mot de passe de votre compte. Le lien d&apos;activation est valable 72 heures.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <FormulaireNouveauMotDePasse action={activer} libelleBouton="Activer mon compte" />
        </Suspense>
      </CardContent>
    </Card>
  );
}
