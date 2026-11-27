"use client";

import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button, type ButtonProps } from "@/components/ui/button";

/** Bouton d'envoi d'un formulaire relié à une Server Function : affiche l'attente. */
export function BoutonEnvoi({ children, ...props }: ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" loading={pending} disabled={pending} {...props}>
      {children}
    </Button>
  );
}

/** Message global d'un formulaire (erreur de l'API, confirmation). */
export function MessageFormulaire({ message, succes }: { message?: string; succes?: boolean }) {
  if (!message) return null;
  return (
    <Alert variant={succes ? "success" : "danger"} role={succes ? "status" : "alert"}>
      {message}
    </Alert>
  );
}
