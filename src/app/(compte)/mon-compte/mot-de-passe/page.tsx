"use client";

import { useActionState } from "react";

import { BoutonEnvoi, MessageFormulaire } from "@/components/espace/formulaire";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/components/ui/input-field";
import { changerMotDePasse, type EtatFormulaire } from "@/modules/securite/actions";
import { LONGUEUR_MIN_MOT_DE_PASSE } from "@/modules/securite/schemas";

/** CU00 – changement du mot de passe imposé à la première connexion. */
export default function PageChangerMotDePasse() {
  const [etat, action] = useActionState<EtatFormulaire, FormData>(changerMotDePasse, {});
  return (
    <Card>
      <CardHeader>
        <CardTitle>Changez votre mot de passe</CardTitle>
        <CardDescription>
          Pour votre première connexion, choisissez un mot de passe personnel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4" noValidate>
          <MessageFormulaire message={etat.message} />
          <InputField
            label="Mot de passe actuel"
            name="ancienMotDePasse"
            type="password"
            autoComplete="current-password"
            required
          />
          <InputField
            label="Nouveau mot de passe"
            name="motDePasse"
            type="password"
            autoComplete="new-password"
            description={`Au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`}
            required
            error={etat.erreurs?.motDePasse}
          />
          <InputField
            label="Confirmation"
            name="confirmation"
            type="password"
            autoComplete="new-password"
            required
            error={etat.erreurs?.confirmation}
          />
          <BoutonEnvoi className="w-full">Enregistrer</BoutonEnvoi>
        </form>
      </CardContent>
    </Card>
  );
}
