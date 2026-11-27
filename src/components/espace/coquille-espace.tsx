import { Building2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AppShell, Topbar } from "@/components/ui/app-shell";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Sidebar, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { hrefsVisibles } from "@/lib/navigation";
import { ROUTES } from "@/lib/routes";
import { lireMoi } from "@/modules/securite/serveur";
import { libelleRole } from "@/modules/securite/types";

import { MenuUtilisateur } from "./menu-utilisateur";
import { NavigationLaterale } from "./navigation-laterale";

/**
 * Coquille de l'espace connecté (charte §6.3) : barre supérieure bleue avec le logo, le nom de
 * l'école et l'utilisateur ; menu latéral filtré par permissions ; contenu au centre.
 * Les parties qui lisent la session sont rendues sous <Suspense> (Cache Components) : la coquille
 * s'affiche tout de suite, l'utilisateur et le menu arrivent ensuite.
 */
export function CoquilleEspace({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      topbar={
        <Topbar
          start={
            <Link href={ROUTES.accueil} aria-label="Delibera, accueil">
              <BrandLogo name="Delibera" inverse />
            </Link>
          }
          center={
            <Suspense fallback={null}>
              <NomEcole />
            </Suspense>
          }
          end={
            <Suspense fallback={<Skeleton className="h-9 w-40 bg-white/20" />}>
              <Utilisateur />
            </Suspense>
          }
        />
      }
      sidebar={
        <Sidebar className="hidden md:flex" aria-label="Menu principal">
          <SidebarContent>
            <Suspense fallback={<SqueletteMenu />}>
              <Menu />
            </Suspense>
          </SidebarContent>
          <SidebarFooter>
            <p className="px-2 text-xs text-fg-quaternary">
              Version {process.env.NEXT_PUBLIC_DELIBERA_VERSION}
            </p>
          </SidebarFooter>
        </Sidebar>
      }
    >
      <Suspense fallback={null}>
        <GardeMotDePasse />
      </Suspense>
      {children}
    </AppShell>
  );
}

/** Mot de passe à changer (première connexion) : aucune autre page tant que ce n'est pas fait. */
async function GardeMotDePasse() {
  const moi = await lireMoi();
  if (moi.doitChangerMotDePasse) redirect(ROUTES.changerMotDePasse);
  return null;
}

async function NomEcole() {
  const moi = await lireMoi();
  return (
    <span className="flex items-center gap-2 truncate text-sm font-medium text-white/90">
      <Building2 className="size-4" aria-hidden />
      {moi.ecole?.nom ?? "Plateforme Delibera"}
    </span>
  );
}

async function Utilisateur() {
  const moi = await lireMoi();
  return <MenuUtilisateur nom={`${moi.prenom} ${moi.nom}`} role={libelleRole(moi)} email={moi.email} />;
}

async function Menu() {
  const moi = await lireMoi();
  return <NavigationLaterale hrefs={hrefsVisibles(moi)} />;
}

function SqueletteMenu() {
  return (
    <div className="flex flex-col gap-2 px-2" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}
