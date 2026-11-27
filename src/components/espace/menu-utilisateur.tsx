"use client";

import { useTransition } from "react";

import { NavUser } from "@/components/ui/nav-user";
import { deconnecter } from "@/modules/securite/actions";

/** Utilisateur connecté dans la barre supérieure, avec la déconnexion (CU00). */
export function MenuUtilisateur({ nom, role, email }: { nom: string; role: string; email: string }) {
  const [, demarrer] = useTransition();
  return (
    <NavUser
      name={nom}
      role={role}
      email={email}
      compact
      inverse
      onLogout={() => demarrer(() => deconnecter())}
    />
  );
}
