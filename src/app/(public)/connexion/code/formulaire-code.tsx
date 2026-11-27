"use client";

import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";

import { BoutonEnvoi, MessageFormulaire } from "@/components/espace/formulaire";
import { FieldError } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { verifierCode, type EtatFormulaire } from "@/modules/securite/actions";

export function FormulaireCode() {
  const suite = useSearchParams().get("suite") ?? "";
  const [code, setCode] = useState("");
  const [etat, action] = useActionState<EtatFormulaire, FormData>(verifierCode, {});

  return (
    <form action={action} className="flex flex-col items-center gap-4">
      <input type="hidden" name="suite" value={suite} />
      <input type="hidden" name="code" value={code} />
      <MessageFormulaire message={etat.message} />
      <InputOTP
        maxLength={6}
        value={code}
        onChange={setCode}
        aria-label="Code à 6 chiffres"
        autoFocus
      >
        <InputOTPGroup>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <FieldError>{etat.erreurs?.code}</FieldError>
      <BoutonEnvoi className="w-full" disabled={code.length !== 6}>
        Valider
      </BoutonEnvoi>
    </form>
  );
}
