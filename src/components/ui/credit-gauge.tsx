import * as React from "react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

type Threshold = { value: number; label: React.ReactNode; tone?: "neutral" | "warning" };

/**
 * Position des crédits par rapport aux seuils (maquette 2) : barre de crédits acquis sur le total,
 * repères « seuil limite » (seuil − marge) et « seuil ».
 */
const CreditGauge = withRef(function CreditGauge({
  className,
  value,
  max = 60,
  thresholds = [],
  label = "Crédits annuels",
  ...props
}: React.ComponentProps<"div"> & { value: number; max?: number; thresholds?: Threshold[]; label?: React.ReactNode }) {
  const pct = (v: number) => `${Math.min(100, Math.max(0, (v / max) * 100))}%`;
  const reached = thresholds.filter((t) => value >= t.value).length;
  const fill = thresholds.length === 0 || reached === thresholds.length ? "bg-status-success" : reached > 0 ? "bg-status-warning" : "bg-brand-blue";
  return (
    <div data-slot="credit-gauge" className={cn("space-y-1.5", className)} {...props}>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-fg-secondary">{label}</span>
        <span className="font-medium tabular-nums text-fg-primary">
          {value} / {max}
        </span>
      </div>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={typeof label === "string" ? label : "Crédits"}
        className="relative h-2.5 rounded-full bg-black/8 dark:bg-white/10"
      >
        <div className={cn("h-full rounded-full transition-[width]", fill)} style={{ width: pct(value) }} />
        {thresholds.map((t) => (
          <span key={t.value} className={cn("absolute -top-1 -bottom-1 w-0.5 rounded-full", t.tone === "warning" ? "bg-status-warning" : "bg-fg-primary")} style={{ left: pct(t.value) }} />
        ))}
      </div>
      {thresholds.length ? (
        <div className="relative h-4 text-[11px] text-fg-tertiary">
          {thresholds.map((t, i) => (
            <span
              key={t.value}
              className={cn("absolute whitespace-nowrap", thresholds.length === 1 ? "-translate-x-1/2" : i < thresholds.length - 1 ? "-translate-x-full pr-1.5" : "pl-1.5")}
              style={{ left: pct(t.value) }}
            >
              {t.label} {t.value}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
});

export { CreditGauge, type Threshold };
