import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { aUneDesPermissions, estDansUnJury, type CodePermission } from "@/lib/permissions";
import { ROUTES } from "@/lib/routes";
import { lireMoi } from "@/modules/securite/serveur";

/**
 * Affiche le contenu seulement si l'utilisateur a l'une des permissions (ou siège dans un jury si
 * `jury`). À placer sous <Suspense> : il lit la session. C'est un confort d'affichage : l'API
 * renverra de toute façon 403 (algorithme A8).
 */
export async function ExigerPermission({
  permissions,
  jury = false,
  children,
}: {
  permissions: readonly CodePermission[];
  jury?: boolean;
  children: ReactNode;
}) {
  const moi = await lireMoi();
  const autorise = aUneDesPermissions(moi, permissions) || (jury && estDansUnJury(moi));
  return autorise ? children : <AccesRefuse />;
}

export function AccesRefuse() {
  return (
    <EmptyState
      icon={<ShieldAlert />}
      title="Accès non autorisé"
      description="Votre rôle ne donne pas accès à cet espace. Adressez-vous à l'administrateur de votre école si vous pensez que c'est une erreur."
      action={
        <Link href={ROUTES.accueil} className={buttonVariants({ variant: "secondary" })}>
          Retour au tableau de bord
        </Link>
      }
    />
  );
}
