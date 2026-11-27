import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageContainer } from "@/components/ui/app-shell";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { estVisible, NAVIGATION } from "@/lib/navigation";
import { ROUTES } from "@/lib/routes";
import { lireMoi } from "@/modules/securite/serveur";

export const metadata: Metadata = { title: "Tableau de bord" };

/** Accueil de l'espace connecté : les espaces accessibles avec le rôle de l'utilisateur. */
export default function PageAccueil() {
  return (
    <PageContainer>
      <Suspense fallback={<Skeleton className="h-16 w-80" />}>
        <EnTete />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <EspacesAccessibles />
      </Suspense>
    </PageContainer>
  );
}

async function EnTete() {
  const moi = await lireMoi();
  return (
    <PageHeader
      title={`Bonjour ${moi.prenom}`}
      description={
        moi.ecole
          ? `Espace de délibération de ${moi.ecole.nom}.`
          : "Administration de la plateforme : écoles clientes et premiers administrateurs."
      }
    />
  );
}

async function EspacesAccessibles() {
  const moi = await lireMoi();
  const espaces = NAVIGATION.flatMap((g) => g.elements).filter(
    (e) => e.href !== ROUTES.accueil && estVisible(e, moi),
  );
  return (
    <section aria-labelledby="titre-espaces" className="flex flex-col gap-3">
      <h2 id="titre-espaces" className="text-base font-semibold">
        Vos espaces
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {espaces.map(({ href, libelle, icone: Icone, module }) => (
          <li key={href}>
            <Link
              href={href}
              className="block rounded-(--radius-card) outline-none focus-visible:shadow-(--shadow-focus)"
            >
              <Card className="h-full transition-shadow hover:shadow-(--shadow-pop)">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icone className="size-4 text-brand-blue" aria-hidden />
                    {libelle}
                  </CardTitle>
                  <CardDescription>Module {module}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
