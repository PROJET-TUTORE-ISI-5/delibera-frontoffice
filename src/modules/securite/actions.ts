"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { appelerApi } from "@/lib/api/serveur";
import { estErreurApi } from "@/lib/api/probleme";
import { ROUTES, suiteSure } from "@/lib/routes";
import { estJetonsSession, type JetonsSession } from "@/lib/session/cookies";
import {
  fermerSession,
  jetonAcces,
  lireCodeEnAttente,
  memoriserCodeEnAttente,
  ouvrirSession,
} from "@/lib/session/serveur";

import {
  schemaCode,
  schemaConnexion,
  schemaDemandeReinitialisation,
  schemaNouveauMotDePasse,
} from "./schemas";
import type { ResultatConnexion } from "./types";

/**
 * Server Functions du module M1 (CU00, CU18, activation CU12). Elles seules appellent les routes
 * /api/v1/auth/** : les jetons ne transitent jamais par le navigateur.
 */

export type EtatFormulaire = {
  message?: string;
  erreurs?: Record<string, string>;
  succes?: boolean;
  /**
   * Valeurs à réafficher : React réinitialise le formulaire après chaque envoi, on les redonne
   * en defaultValue (jamais un mot de passe).
   */
  valeurs?: Record<string, string>;
};

const MESSAGE_IDENTIFIANTS = "Adresse e-mail ou mot de passe incorrect, ou compte indisponible.";

function erreursDeValidation(erreur: z.ZodError): Record<string, string> {
  return Object.fromEntries(
    erreur.issues.map((i) => [String(i.path[0] ?? "formulaire"), i.message]),
  );
}

function messageDe(erreur: unknown, parDefaut: string): string {
  if (!estErreurApi(erreur)) return parDefaut;
  if (erreur.status === 502) return erreur.messageUtilisateur;
  return erreur.probleme.detail ?? parDefaut;
}

/** CU00 – connexion par e-mail et mot de passe. */
export async function connecter(_etat: EtatFormulaire, donnees: FormData): Promise<EtatFormulaire> {
  const saisie = schemaConnexion.safeParse({
    email: donnees.get("email"),
    motDePasse: donnees.get("motDePasse"),
  });
  const valeurs = { email: String(donnees.get("email") ?? "") };
  if (!saisie.success) return { erreurs: erreursDeValidation(saisie.error), valeurs };

  let resultat: ResultatConnexion;
  try {
    resultat = await appelerApi<ResultatConnexion>("/auth/connexion", {
      methode: "POST",
      jeton: null,
      corps: saisie.data,
    });
  } catch (erreur) {
    // Message neutre : ne jamais révéler si le compte existe (CU00, scénario alternatif).
    if (estErreurApi(erreur) && [400, 401, 403, 404, 422, 423].includes(erreur.status)) {
      return { message: MESSAGE_IDENTIFIANTS, valeurs };
    }
    return {
      message: messageDe(erreur, "La connexion a échoué. Réessayez dans un instant."),
      valeurs,
    };
  }

  const suite = suiteSure(String(donnees.get("suite") ?? ""));

  if (resultat.doubleAuthentificationRequise && resultat.jetonIntermediaire) {
    await memoriserCodeEnAttente(resultat.jetonIntermediaire);
    redirect(`${ROUTES.codeConnexion}?suite=${encodeURIComponent(suite)}`);
  }
  if (!estJetonsSession(resultat.jetons)) {
    return { message: "Réponse inattendue du serveur. Réessayez dans un instant.", valeurs };
  }
  await ouvrirSession(resultat.jetons);
  redirect(resultat.doitChangerMotDePasse ? ROUTES.changerMotDePasse : suite);
}

/** CU00 – double authentification : code TOTP à 6 chiffres. */
export async function verifierCode(
  _etat: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  const saisie = schemaCode.safeParse({ code: donnees.get("code") });
  if (!saisie.success) return { erreurs: erreursDeValidation(saisie.error) };

  const jetonIntermediaire = await lireCodeEnAttente();
  if (!jetonIntermediaire) redirect(ROUTES.connexion);

  let jetons: JetonsSession;
  try {
    jetons = await appelerApi<JetonsSession>("/auth/code", {
      methode: "POST",
      jeton: null,
      corps: { jetonIntermediaire, code: saisie.data.code },
    });
  } catch (erreur) {
    return { message: messageDe(erreur, "Code incorrect ou expiré.") };
  }
  if (!estJetonsSession(jetons)) return { message: "Réponse inattendue du serveur." };
  await ouvrirSession(jetons);
  redirect(suiteSure(String(donnees.get("suite") ?? "")));
}

/** CU00 – déconnexion : révocation côté API, puis suppression des cookies. */
export async function deconnecter(): Promise<void> {
  const jeton = await jetonAcces();
  if (jeton) {
    try {
      await appelerApi("/auth/deconnexion", { methode: "POST", jeton });
    } catch {
      // La session expirera d'elle-même : la déconnexion locale suffit.
    }
  }
  await fermerSession();
  redirect(ROUTES.connexion);
}

/** CU18 – demande de lien de réinitialisation (même réponse que le compte existe ou non). */
export async function demanderReinitialisation(
  _etat: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  const saisie = schemaDemandeReinitialisation.safeParse({ email: donnees.get("email") });
  const valeurs = { email: String(donnees.get("email") ?? "") };
  if (!saisie.success) return { erreurs: erreursDeValidation(saisie.error), valeurs };
  try {
    await appelerApi("/auth/mot-de-passe-oublie", {
      methode: "POST",
      jeton: null,
      corps: saisie.data,
    });
  } catch (erreur) {
    if (estErreurApi(erreur) && erreur.status >= 500)
      return { message: erreur.messageUtilisateur, valeurs };
  }
  return {
    succes: true,
    message:
      "Si un compte actif correspond à cette adresse, un lien valable 30 minutes vient d'y être envoyé.",
  };
}

async function definirMotDePasse(
  route: "/auth/reinitialisation" | "/auth/activation",
  donnees: FormData,
): Promise<EtatFormulaire> {
  const saisie = schemaNouveauMotDePasse.safeParse({
    motDePasse: donnees.get("motDePasse"),
    confirmation: donnees.get("confirmation"),
  });
  if (!saisie.success) return { erreurs: erreursDeValidation(saisie.error) };
  const jeton = String(donnees.get("jeton") ?? "");
  if (!jeton) return { message: "Lien incomplet : ouvrez de nouveau le lien reçu par e-mail." };
  try {
    await appelerApi(route, {
      methode: "POST",
      jeton: null,
      corps:
        route === "/auth/activation"
          ? { jeton, motDePasse: saisie.data.motDePasse }
          : { jeton, nouveauMotDePasse: saisie.data.motDePasse },
    });
  } catch (erreur) {
    return {
      message: messageDe(erreur, "Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau."),
    };
  }
  return { succes: true, message: "Mot de passe enregistré. Vous pouvez vous connecter." };
}

/** CU18 – nouveau mot de passe avec le lien reçu (usage unique, 30 min). */
export async function reinitialiser(
  _etat: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  return definirMotDePasse("/auth/reinitialisation", donnees);
}

/** CU12 – activation d'un compte avec le lien reçu (72 h). */
export async function activer(_etat: EtatFormulaire, donnees: FormData): Promise<EtatFormulaire> {
  return definirMotDePasse("/auth/activation", donnees);
}

/** CU00 – changement du mot de passe imposé à la première connexion. */
export async function changerMotDePasse(
  _etat: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  const saisie = schemaNouveauMotDePasse.safeParse({
    motDePasse: donnees.get("motDePasse"),
    confirmation: donnees.get("confirmation"),
  });
  if (!saisie.success) return { erreurs: erreursDeValidation(saisie.error) };
  try {
    await appelerApi("/moi/mot-de-passe", {
      methode: "PUT",
      corps: {
        ancienMotDePasse: String(donnees.get("ancienMotDePasse") ?? ""),
        nouveauMotDePasse: saisie.data.motDePasse,
      },
    });
  } catch (erreur) {
    if (estErreurApi(erreur) && erreur.estSessionExpiree) redirect(ROUTES.connexion);
    return { message: messageDe(erreur, "Le mot de passe n'a pas pu être changé.") };
  }
  redirect(ROUTES.accueil);
}
