"use client";

import { RefreshCw } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { PageContainer } from "@/components/ui/app-shell";
import { Button } from "@/components/ui/button";

/**
 * Erreur d'un écran de l'espace connecté (API injoignable, réponse inattendue…).
 * Le détail technique n'est jamais affiché : il est dans le journal du serveur (digest).
 */
export default function ErreurEspace({ error, retry }: { error: unknown; retry: () => void }) {
  const reference = error instanceof Error && "digest" in error ? String(error.digest) : undefined;
  return (
    <PageContainer>
      <Alert variant="danger" role="alert">
        Cet écran n&apos;a pas pu être affiché. Réessayez ; si le problème persiste, signalez-le
        {reference ? ` avec la référence ${reference}` : ""}.
      </Alert>
      <div>
        <Button variant="secondary" onClick={() => retry()}>
          <RefreshCw aria-hidden />
          Réessayer
        </Button>
      </div>
    </PageContainer>
  );
}
