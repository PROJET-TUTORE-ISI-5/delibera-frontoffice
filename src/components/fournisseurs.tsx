"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { estErreurApi } from "@/lib/api/probleme";

/**
 * Fournisseurs côté navigateur : cache des données serveur (TanStack Query, cahier de conception
 * tableau 3). Les données d'une séance changent souvent : elles sont considérées comme périmées
 * au bout de 30 s, et rechargées au retour sur l'onglet.
 */
export function Fournisseurs({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: true,
            // Pas de nouvel essai sur une erreur fonctionnelle (4xx) : seulement sur le réseau.
            retry: (tentatives, erreur) =>
              tentatives < 2 && !(estErreurApi(erreur) && erreur.status < 500),
          },
          mutations: { retry: false },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
