import {
  BarChart3,
  Building2,
  FileUp,
  Gavel,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  ScrollText,
  Settings2,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";

import { aUneDesPermissions, estDansUnJury, type CodePermission, type Habilitations } from "./permissions";
import { ROUTES } from "./routes";

export type ElementNavigation = {
  libelle: string;
  href: string;
  icone: LucideIcon;
  /** Module du cahier de conception (tableau 5). */
  module: string;
  /** Visible si l'utilisateur a l'une de ces permissions. Absent : visible par tous. */
  permissions?: readonly CodePermission[];
  /** Visible aussi pour un membre d'un jury, même sans rôle qui porte la permission. */
  jury?: boolean;
};

export type GroupeNavigation = { libelle: string; elements: readonly ElementNavigation[] };

/**
 * Menu latéral. Une entrée par espace du client web ; l'ordre suit le déroulé d'une année :
 * paramétrage, import, délibération, suivi. Ajouter une page = ajouter une entrée ici.
 */
export const NAVIGATION: readonly GroupeNavigation[] = [
  {
    libelle: "Délibérations",
    elements: [
      { libelle: "Tableau de bord", href: ROUTES.accueil, icone: LayoutDashboard, module: "—" },
      {
        libelle: "Délibérations",
        href: ROUTES.deliberations,
        icone: Gavel,
        module: "M7",
        permissions: ["DOSSIER_CONSULTER", "PREDELIB_LANCER", "JURY_CONSTITUER"],
        jury: true,
      },
      {
        libelle: "Import des données",
        href: ROUTES.importation,
        icone: FileUp,
        module: "M5",
        permissions: ["DONNEES_IMPORTER", "RATTRAPAGE_SAISIR"],
      },
    ],
  },
  {
    libelle: "Paramétrage",
    elements: [
      {
        libelle: "Référentiel académique",
        href: ROUTES.referentiel,
        icone: Settings2,
        module: "M3",
        permissions: ["REFERENTIEL_GERER"],
      },
      {
        libelle: "Règles de passage",
        href: ROUTES.regles,
        icone: ListChecks,
        module: "M4",
        permissions: ["REGLE_GERER"],
      },
      {
        libelle: "Paramètres de délibération",
        href: ROUTES.parametres,
        icone: SlidersHorizontal,
        module: "M4",
        permissions: ["PARAM_GERER"],
      },
    ],
  },
  {
    libelle: "Suivi",
    elements: [
      {
        libelle: "Statistiques",
        href: ROUTES.statistiques,
        icone: BarChart3,
        module: "M8",
        permissions: ["STATS_CONSULTER"],
      },
      {
        libelle: "Journal d'audit",
        href: ROUTES.audit,
        icone: ScrollText,
        module: "M9",
        permissions: ["AUDIT_CONSULTER"],
      },
    ],
  },
  {
    libelle: "Administration",
    elements: [
      {
        libelle: "Utilisateurs",
        href: ROUTES.utilisateurs,
        icone: Users,
        module: "M1",
        permissions: ["UTILISATEUR_GERER"],
      },
      {
        libelle: "Rôles et permissions",
        href: ROUTES.roles,
        icone: KeyRound,
        module: "M1",
        permissions: ["ROLE_GERER"],
      },
    ],
  },
  {
    libelle: "Plateforme",
    elements: [
      {
        libelle: "Écoles clientes",
        href: ROUTES.ecoles,
        icone: Building2,
        module: "M2",
        permissions: ["ECOLE_GERER"],
      },
    ],
  },
];

export function estVisible(element: ElementNavigation, h: Habilitations): boolean {
  if (!element.permissions) return true;
  return aUneDesPermissions(h, element.permissions) || (element.jury === true && estDansUnJury(h));
}

/** Adresses des entrées visibles : calculées côté serveur, transmises au menu (client). */
export function hrefsVisibles(h: Habilitations): string[] {
  return NAVIGATION.flatMap((g) => g.elements.filter((e) => estVisible(e, h)).map((e) => e.href));
}

/** Entrée active pour une adresse : la plus longue qui la préfixe. */
export function elementActif(chemin: string, hrefs: readonly string[]): string | undefined {
  return [...hrefs]
    .filter((h) => (h === ROUTES.accueil ? chemin === h : chemin === h || chemin.startsWith(`${h}/`)))
    .sort((a, b) => b.length - a.length)[0];
}
