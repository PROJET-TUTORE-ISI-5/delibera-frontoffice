import { SearchX } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LinearBackground } from "@/components/ui/linear-background";
import { ROUTES } from "@/lib/routes";

export default function PageIntrouvable() {
  return (
    <LinearBackground className="flex min-h-svh items-center justify-center px-4">
      <EmptyState
        className="bg-bg-surface"
        icon={<SearchX />}
        title="Page introuvable"
        description="L'adresse demandée n'existe pas ou n'est plus disponible."
        action={
          <Link href={ROUTES.accueil} className={buttonVariants({ variant: "primary" })}>
            Retour au tableau de bord
          </Link>
        }
      />
    </LinearBackground>
  );
}
