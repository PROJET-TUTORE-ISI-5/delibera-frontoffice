"use client";

import Link from "next/link";
import { useActionState } from "react";

import { BoutonEnvoi, MessageFormulaire } from "@/components/espace/formulaire";
import { InputField } from "@/components/ui/input-field";
import { ROUTES } from "@/lib/routes";
import { connecter, type EtatFormulaire } from "@/modules/securite/actions";

/**
 * CU00 – formulaire de connexion (e-mail et mot de passe). `suite` vient de la page, lue côté
 * serveur : le formulaire figure ainsi dans le HTML, avant le chargement du JavaScript.
 */
export function FormulaireConnexion({ suite }: { suite: string }) {
  const [etat, action] = useActionState<EtatFormulaire, FormData>(connecter, {});

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="suite" value={suite} />
      <MessageFormulaire message={etat.message} succes={etat.succes} />
      <InputField
        label="Adresse e-mail"
        name="email"
        type="email"
        autoComplete="username"
        defaultValue={etat.valeurs?.email}
        required
        error={etat.erreurs?.email}
      />
      <InputField
        label="Mot de passe"
        name="motDePasse"
        type="password"
        autoComplete="current-password"
        required
        error={etat.erreurs?.motDePasse}
      />
      <BoutonEnvoi className="w-full">Se connecter</BoutonEnvoi>
      <Link
        href={ROUTES.motDePasseOublie}
        className="text-center text-sm text-brand-blue underline-offset-4 hover:underline"
      >
        Mot de passe oublié ?
      </Link>
    </form>
  );
}
