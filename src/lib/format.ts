/**
 * Mise en forme à l'affichage (charte, cahier de conception §6.3) :
 * notes avec une virgule et deux décimales (8,50), chiffres tabulaires dans les tableaux,
 * dates stockées en UTC et affichées dans le fuseau de l'école.
 * Aucun calcul de note ne se fait dans le client : l'API renvoie des valeurs déjà arrondies.
 */

const FORMAT_NOTE = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const FORMAT_ENTIER = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** Fuseau par défaut tant que l'école n'est pas connue (question ouverte M2 n° 2). */
export const FUSEAU_PAR_DEFAUT = "Africa/Douala";

/** 8.5 -> « 8,50 » ; null ou valeur illisible -> « — ». */
export function formaterNote(note: number | string | null | undefined): string {
  if (note === null || note === undefined || note === "") return "—";
  const n = typeof note === "number" ? note : Number(note);
  return Number.isFinite(n) ? FORMAT_NOTE.format(n) : "—";
}

/** 45 -> « 45 crédits » ; 1 -> « 1 crédit ». */
export function formaterCredits(credits: number | null | undefined): string {
  if (credits === null || credits === undefined) return "—";
  return `${FORMAT_ENTIER.format(credits)} crédit${Math.abs(credits) > 1 ? "s" : ""}`;
}

/** Date ISO (UTC) -> « 27/11/2026 » dans le fuseau de l'école. */
export function formaterDate(iso: string | null | undefined, fuseau = FUSEAU_PAR_DEFAUT): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { timeZone: fuseau, dateStyle: "short" }).format(d);
}

/** Date-heure ISO (UTC) -> « 27/11/2026 14:05 » dans le fuseau de l'école. */
export function formaterDateHeure(
  iso: string | null | undefined,
  fuseau = FUSEAU_PAR_DEFAUT,
): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: fuseau,
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}
