import { CoquilleEspace } from "@/components/espace/coquille-espace";

/** Espace connecté : toutes les pages de travail, derrière la garde de session (src/proxy.ts). */
export default function EspaceLayout({ children }: LayoutProps<"/">) {
  return <CoquilleEspace>{children}</CoquilleEspace>;
}
