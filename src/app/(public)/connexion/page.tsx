import type { Metadata } from "next";
import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { valeurParametre } from "@/lib/routes";

import { FormulaireConnexion } from "./formulaire-connexion";

export const metadata: Metadata = { title: "Connexion" };

/** CU00 – S'authentifier. */
export default function PageConnexion({ searchParams }: PageProps<"/connexion">) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>Accédez à l&apos;espace de délibération de votre école.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="h-56 w-full" />}>
          {searchParams.then(({ suite }) => (
            <FormulaireConnexion suite={valeurParametre(suite)} />
          ))}
        </Suspense>
      </CardContent>
    </Card>
  );
}
