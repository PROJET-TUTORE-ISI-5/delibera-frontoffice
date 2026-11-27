"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { elementActif, NAVIGATION } from "@/lib/navigation";

/**
 * Menu latéral. Le serveur décide quelles entrées sont visibles (permissions de l'utilisateur) et
 * transmet leurs adresses ; ce composant les affiche et signale la page en cours.
 */
export function NavigationLaterale({ hrefs }: { hrefs: readonly string[] }) {
  const chemin = usePathname();
  const actif = elementActif(chemin, hrefs);

  return NAVIGATION.map((groupe) => {
    const elements = groupe.elements.filter((e) => hrefs.includes(e.href));
    if (elements.length === 0) return null;
    return (
      <SidebarGroup key={groupe.libelle} label={groupe.libelle}>
        <SidebarMenu>
          {elements.map(({ href, libelle, icone: Icone }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton asChild isActive={href === actif}>
                <Link href={href} aria-current={href === actif ? "page" : undefined}>
                  <Icone aria-hidden />
                  <span>{libelle}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    );
  });
}
