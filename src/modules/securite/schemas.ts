import { z } from "zod";

/**
 * Validation des formulaires du module M1, côté navigateur (confort) et côté Server Function
 * (sécurité). Les règles métier restent vérifiées par l'API : ces schémas n'en ajoutent pas.
 */

/** BNF05 : 10 caractères au minimum (valeur configurable côté API ; ce minimum n'est qu'un confort). */
export const LONGUEUR_MIN_MOT_DE_PASSE = 10;

export const schemaConnexion = z.object({
  email: z.email({ error: "Saisissez une adresse e-mail valide." }).trim().toLowerCase(),
  motDePasse: z.string().min(1, { error: "Saisissez votre mot de passe." }),
});
export type DonneesConnexion = z.infer<typeof schemaConnexion>;

export const schemaCode = z.object({
  code: z.string().regex(/^\d{6}$/, { error: "Le code comporte 6 chiffres." }),
});

export const schemaDemandeReinitialisation = z.object({
  email: z.email({ error: "Saisissez une adresse e-mail valide." }).trim().toLowerCase(),
});

export const schemaNouveauMotDePasse = z
  .object({
    motDePasse: z.string().min(LONGUEUR_MIN_MOT_DE_PASSE, {
      error: `Au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`,
    }),
    confirmation: z.string(),
  })
  .refine((d) => d.motDePasse === d.confirmation, {
    error: "Les deux mots de passe sont différents.",
    path: ["confirmation"],
  });
