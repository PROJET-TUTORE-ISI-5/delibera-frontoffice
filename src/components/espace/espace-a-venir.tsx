import { Construction } from "lucide-react";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import type { CodePermission } from "@/lib/permissions";

import { ExigerPermission } from "./acces";

export type CasUtilisation = { code: string; libelle: string };

type Props = {
  titre: string;
  description: string;
  /** Module du cahier de conception, par exemple « M7 – Délibération et jury ». */
  module: string;
  /** Itération de l'implémentation (cahier de conception §4.1). */
  iteration: number;
  cas: readonly CasUtilisation[];
  permissions: readonly CodePermission[];
  jury?: boolean;
  /** Composants du design system prévus pour l'écran (cahier de conception, tableau 8). */
  composants?: readonly string[];
};

/**
 * Page d'un espace dont les écrans ne sont pas encore développés : elle donne le cadre (titre,
 * module, cas d'utilisation, permission, composants prévus). À remplacer par l'écran réel en
 * suivant le SPEC.md du module (AGENT.md, section 11).
 */
export function EspaceAVenir(props: Props) {
  return (
    <PageContainer>
      <PageHeader
        title={props.titre}
        description={props.description}
        actions={<Badge variant="blue">{props.module}</Badge>}
      />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <ExigerPermission permissions={props.permissions} jury={props.jury}>
          <EmptyState
            icon={<Construction />}
            title={`Écrans prévus à l'itération ${props.iteration}`}
            description="Cet espace est en place dans la navigation ; ses écrans seront construits à partir du SPEC.md du module."
          />
          <Card>
            <CardHeader>
              <CardTitle>Cadre de l&apos;espace</CardTitle>
              <CardDescription>Repris du cahier d&apos;analyse et du cahier de conception.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-3">
              <section>
                <h2 className="mb-2 font-medium">Cas d&apos;utilisation</h2>
                <ul className="space-y-1 text-fg-secondary">
                  {props.cas.map((c) => (
                    <li key={c.code}>
                      <span className="font-medium text-fg-primary">{c.code}</span> {c.libelle}
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="mb-2 font-medium">Permissions</h2>
                <ul className="flex flex-wrap gap-1">
                  {props.permissions.map((p) => (
                    <li key={p}>
                      <Badge variant="neutral">{p}</Badge>
                    </li>
                  ))}
                  {props.jury ? (
                    <li>
                      <Badge variant="neutral">membre du jury</Badge>
                    </li>
                  ) : null}
                </ul>
              </section>
              {props.composants?.length ? (
                <section>
                  <h2 className="mb-2 font-medium">Composants du design system</h2>
                  <p className="text-fg-secondary">{props.composants.join(", ")}</p>
                </section>
              ) : null}
            </CardContent>
          </Card>
        </ExigerPermission>
      </Suspense>
    </PageContainer>
  );
}
