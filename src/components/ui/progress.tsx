"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** Barre de progression (saisie des notes). */

const Progress = withRef(function Progress({
  className,
  value,
  tone = "brand",
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { tone?: "brand" | "success" | "warning" | "danger" }) {
  const bar = {
    brand: "bg-brand-blue",
    success: "bg-status-success",
    warning: "bg-status-warning",
    danger: "bg-status-danger",
  }[tone];
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-black/8 dark:bg-white/10", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn("h-full w-full flex-1 rounded-full transition-transform", bar)}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});

export { Progress };
