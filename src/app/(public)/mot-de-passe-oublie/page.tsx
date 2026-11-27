"use client";

import Link from "next/link";
import { useActionState } from "react";

import { BoutonEnvoi, MessageFormulaire } from "@/components/espace/formulaire";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/components/ui/input-field";
import { ROUTES } from "@/lib/routes";
import { demanderReinitialisation, type EtatFormulaire } from "@/modules/securite/actions";

/** CU18 – Réinitialiser son mot de passe : demande du lien (30 min, usage unique). */
export default function PageMotDePasseOublie() {
  const [etat, action] = useActionState<EtatFormulaire, FormData>(demanderReinitialisation, {});
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mot de passe oublié</CardTitle>
        <CardDescription>
          Recevez par e-mail un lien pour choisir un nouveau mot de passe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4" noValidate>
          <MessageFormulaire message={etat.message} succes={etat.succes} />
          {etat.succes ? null : (
            <>
              <InputField
                label="Adresse e-mail"
                name="email"
                type="email"
                autoComplete="username"
                defaultValue={etat.valeurs?.email}
                required
                error={etat.erreurs?.email}
              />
              <BoutonEnvoi className="w-full">Envoyer le lien</BoutonEnvoi>
            </>
          )}
          <Link
            href={ROUTES.connexion}
            className="text-center text-sm text-brand-blue hover:underline"
          >
            Retour à la connexion
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
