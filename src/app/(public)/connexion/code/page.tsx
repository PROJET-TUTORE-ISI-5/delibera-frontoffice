import type { Metadata } from "next";
import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { valeurParametre } from "@/lib/routes";

import { FormulaireCode } from "./formulaire-code";

export const metadata: Metadata = { title: "Code de vérification" };

/** CU00 – double authentification exigée par l'école (code TOTP, RFC 6238). */
export default function PageCode({ searchParams }: PageProps<"/connexion/code">) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Code de vérification</CardTitle>
        <CardDescription>
          Saisissez le code à 6 chiffres affiché par votre application d&apos;authentification.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="h-32 w-full" />}>
          {searchParams.then(({ suite }) => (
            <FormulaireCode suite={valeurParametre(suite)} />
          ))}
        </Suspense>
      </CardContent>
    </Card>
  );
}
