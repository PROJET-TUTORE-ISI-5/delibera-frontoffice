import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** Badges de statut et DecisionBadge : les 6 états de décision du cahier (pastille arrondie, majuscules). */

const COLOR_VARIANTS = ["neutral", "blue", "green", "red", "orange", "violet"] as const;
type ColorVariant = (typeof COLOR_VARIANTS)[number];

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center overflow-hidden border border-black/10 font-medium whitespace-nowrap tracking-tight dark:border-white/10 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        neutral: "bg-bg-surface text-badge-neutral dark:border-white/15 dark:bg-white/10",
        blue: "bg-[rgba(101,160,253,0.1)] text-badge-blue",
        green: "bg-[rgba(102,220,126,0.1)] text-badge-green",
        red: "bg-[rgba(238,110,108,0.1)] text-badge-red",
        orange: "bg-[rgba(243,143,54,0.1)] text-badge-orange",
        violet: "bg-[rgba(161,133,253,0.1)] text-badge-violet",
        "success-soft": "border-[hsla(240,4%,16%,0.1)] bg-[hsla(132,63%,63%,0.1)] text-[hsla(129,43%,35%,1)] dark:text-[#7ddea0]",
        "warning-soft": "border-[hsla(240,4%,16%,0.1)] bg-[hsla(28,89%,58%,0.1)] text-[hsla(18,87%,35%,1)] dark:text-[#ffb089]",
        "danger-soft": "border-[hsla(240,4%,16%,0.1)] bg-[hsla(1,79%,68%,0.1)] text-[hsla(1,74%,40%,1)] dark:text-[#ff9d9b]",
      },
      layout: {
        default: "gap-0 px-1.5 py-0.5",
        dot: "gap-0 py-0.5 pr-1 pl-0.5",
        icon: "gap-0 py-0.5 pr-1 pl-0.5",
      },
      size: {
        sm: "text-xs leading-4",
        lg: "text-sm leading-5",
      },
      shape: {
        rounded: "rounded-md",
        pill: "rounded-full",
      },
    },
    defaultVariants: { variant: "neutral", layout: "default", size: "sm", shape: "rounded" },
  },
);

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    /** Icône de tête quand layout="icon". */
    icon?: React.ReactNode;
  };

const Badge = withRef(function Badge({ className, variant = "neutral", layout = "default", size, shape, icon, children, ...props }: BadgeProps) {
  const isColor = COLOR_VARIANTS.includes(variant as ColorVariant);
  return (
    <span data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant, layout, size, shape }), className)} {...props}>
      {isColor && layout === "dot" ? (
        <span className="flex size-4 shrink-0 items-center justify-center">
          <span className="size-1.5 rounded-full bg-current" />
        </span>
      ) : null}
      {isColor && layout === "icon" && icon ? (
        <span className="flex size-4 shrink-0 items-center justify-center [&_svg:not([class*='size-'])]:size-3">{icon}</span>
      ) : null}
      {children}
    </span>
  );
});

/** États de décision (cahier de conception §2.1 / EtatDecision) → couleur. Le libellé porte toujours le sens. */
const DECISION_STATES = {
  ADMIS: { label: "Admis", variant: "green" },
  ADMIS_APRES_RATTRAPAGE: { label: "Admis après rattrapage", variant: "green" },
  SOUS_CONDITION: { label: "Sous condition", variant: "orange" },
  A_DELIBERER: { label: "À délibérer", variant: "orange" },
  AJOURNE: { label: "Ajourné", variant: "red" },
  BLOQUE_POUR_DETTE: { label: "Bloqué pour dette", variant: "red" },
} as const satisfies Record<string, { label: string; variant: ColorVariant }>;

type EtatDecision = keyof typeof DECISION_STATES;

/** Pastille d'état de décision : arrondie, texte en majuscules, couleur selon l'état. */
const DecisionBadge = withRef(function DecisionBadge({
  etat,
  className,
  children,
  ...props
}: Omit<BadgeProps, "variant" | "layout" | "shape"> & { etat: EtatDecision }) {
  const { label, variant } = DECISION_STATES[etat];
  return (
    <Badge
      variant={variant}
      layout="dot"
      shape="pill"
      data-etat={etat}
      className={cn("uppercase tracking-wide", className)}
      {...props}
    >
      {children ?? label}
    </Badge>
  );
});

export { Badge, DecisionBadge, DECISION_STATES, badgeVariants, type BadgeProps, type EtatDecision };
