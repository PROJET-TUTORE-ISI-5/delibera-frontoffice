import { NextResponse, type NextRequest } from "next/server";

import { config as reglages } from "@/lib/config";
import { estRoutePublique, ROUTES } from "@/lib/routes";
import {
  COOKIE_ACCES,
  COOKIE_RENOUVELLEMENT,
  cookiesDeSession,
  remplacerCookies,
} from "@/lib/session/cookies";
import { renouvelerJetons } from "@/lib/session/renouvellement";

/**
 * Garde de navigation (Next.js 16 : « proxy », ex-middleware).
 *  - page protégée sans session : redirection vers /connexion?suite=<page demandée> ;
 *  - jeton d'accès expiré mais jeton de renouvellement présent : renouvellement transparent, puis
 *    la page est rendue avec les nouveaux cookies ;
 *  - utilisateur déjà connecté sur /connexion : retour à l'accueil.
 *
 * Ce n'est qu'un confort de navigation : l'API vérifie chaque requête (algorithme A8). Les appels
 * du navigateur passent par le relais src/app/api/[...chemin]/route.ts, exclu d'ici, qui gère sa
 * propre session.
 */
export async function proxy(request: NextRequest) {
  const chemin = request.nextUrl.pathname;
  const publique = estRoutePublique(chemin);

  if (reglages.sessionFictive) return NextResponse.next();

  const acces = request.cookies.get(COOKIE_ACCES)?.value;
  const renouvellement = request.cookies.get(COOKIE_RENOUVELLEMENT)?.value;

  if (acces) {
    if (chemin === ROUTES.connexion) return rediriger(request, ROUTES.accueil);
    return NextResponse.next();
  }

  if (renouvellement) {
    const jetons = await renouvelerJetons(reglages.apiUrl, renouvellement, reglages.delaiApi);
    if (jetons) {
      const nouveaux = cookiesDeSession(jetons, {
        basePath: reglages.basePath,
        secure: reglages.cookiesSecurises,
        dureeRenouvellement: reglages.dureeRenouvellement,
      });
      // La page rendue maintenant doit déjà voir les nouveaux jetons.
      const enTetes = new Headers(request.headers);
      enTetes.set(
        "cookie",
        remplacerCookies(
          request.cookies.getAll(),
          Object.fromEntries(nouveaux.map((c) => [c.name, c.value])),
        ),
      );
      const reponse =
        chemin === ROUTES.connexion
          ? rediriger(request, ROUTES.accueil)
          : NextResponse.next({ request: { headers: enTetes } });
      for (const c of nouveaux) reponse.cookies.set(c.name, c.value, c.options);
      return reponse;
    }
  }

  if (publique) {
    const reponse = NextResponse.next();
    if (renouvellement) effacerSession(reponse);
    return reponse;
  }

  const suite = `${chemin}${request.nextUrl.search}`;
  const reponse = rediriger(
    request,
    ROUTES.connexion,
    chemin === ROUTES.accueil ? undefined : suite,
  );
  if (renouvellement) effacerSession(reponse);
  return reponse;
}

function rediriger(request: NextRequest, vers: string, suite?: string) {
  const url = request.nextUrl.clone();
  url.pathname = vers;
  url.search = "";
  if (suite) url.searchParams.set("suite", suite);
  return NextResponse.redirect(url);
}

function effacerSession(reponse: NextResponse) {
  for (const nom of [COOKIE_ACCES, COOKIE_RENOUVELLEMENT]) {
    reponse.cookies.set(nom, "", { path: reglages.basePath || "/", maxAge: 0 });
  }
}

export const config = {
  // Ni le relais /api, ni la sonde /sante, ni les fichiers statiques.
  matcher: ["/", "/((?!api/|sante|_next/static|_next/image|favicon.ico|.*\\.[a-z0-9]+$).*)"],
};
