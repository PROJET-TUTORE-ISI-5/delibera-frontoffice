import * as React from "react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** Indicateur chiffré avec liseré de couleur à gauche (maquette 1 : « 112 ADMIS », « 9 À DÉLIBÉRER »). */
const StatCard = withRef(function StatCard({
  className,
  value,
  label,
  tone = "neutral",
  hint,
  active,
  onClick,
  ...props
}: Omit<React.ComponentProps<"div">, "onClick"> & {
  value: React.ReactNode;
  label: React.ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning" | "danger";
  hint?: React.ReactNode;
  /** Filtre actif (carte cliquable). */
  active?: boolean;
  onClick?: () => void;
}) {
  const bar = {
    neutral: "before:bg-fg-quaternary",
    brand: "before:bg-brand-blue",
    success: "before:bg-status-success",
    warning: "before:bg-status-warning",
    danger: "before:bg-status-danger",
  }[tone];
  return (
    <div
      data-slot="stat-card"
      data-active={active || undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? !!active : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onClick()) : undefined}
      className={cn(
        "relative overflow-hidden rounded-(--radius-row) bg-bg-surface py-3 pr-4 pl-5 shadow-(--shadow-card) before:absolute before:inset-y-0 before:left-0 before:w-1",
        bar,
        onClick && "cursor-pointer outline-none transition-shadow hover:shadow-(--shadow-pop) focus-visible:shadow-(--shadow-focus)",
        active && "ring-2 ring-brand-blue/40",
        className,
      )}
      {...props}
    >
      <p className="text-2xl leading-8 font-semibold tracking-display tabular-nums text-fg-primary">{value}</p>
      <p className="text-xs font-medium tracking-wide text-fg-tertiary uppercase">{label}</p>
      {hint ? <p className="mt-1 text-xs text-fg-tertiary">{hint}</p> : null}
    </div>
  );
});

export { StatCard };
