import { PageContainer } from "@/components/ui/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

/** Chargement d'un écran de l'espace connecté. */
export default function ChargementEspace() {
  return (
    <PageContainer aria-busy="true" aria-label="Chargement">
      <Skeleton className="h-7 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-80 w-full" />
    </PageContainer>
  );
}
