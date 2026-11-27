"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

import { BoutonEnvoi, MessageFormulaire } from "@/components/espace/formulaire";
import { InputField } from "@/components/ui/input-field";
import { ROUTES } from "@/lib/routes";
import type { EtatFormulaire } from "@/modules/securite/actions";
import { LONGUEUR_MIN_MOT_DE_PASSE } from "@/modules/securite/schemas";

type Props = {
  action: (etat: EtatFormulaire, donnees: FormData) => Promise<EtatFormulaire>;
  libelleBouton: string;
};

/** Choix d'un mot de passe à partir d'un lien reçu par e-mail (?jeton=…) : activation ou réinitialisation. */
export function FormulaireNouveauMotDePasse({ action: serverAction, libelleBouton }: Props) {
  const jeton = useSearchParams().get("jeton") ?? "";
  const [etat, action] = useActionState<EtatFormulaire, FormData>(serverAction, {});

  if (etat.succes) {
    return (
      <div className="flex flex-col gap-4">
        <MessageFormulaire message={etat.message} succes />
        <Link href={ROUTES.connexion} className="text-center text-sm text-brand-blue hover:underline">
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="jeton" value={jeton} />
      <MessageFormulaire message={etat.message} />
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
      <BoutonEnvoi className="w-full">{libelleBouton}</BoutonEnvoi>
    </form>
  );
}
