import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

const chipVariants = cva(
  "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap transition-colors [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-border-subtle bg-bg-surface text-fg-secondary shadow-xs dark:bg-white/5",
        soft: "border-transparent bg-black/6 text-fg-secondary dark:bg-white/8",
        brand: "border-brand-blue/20 bg-brand-blue-soft text-brand-blue-deep",
      },
      selected: { true: "border-brand-blue bg-brand-blue-soft text-brand-blue-deep", false: "" },
      interactive: { true: "cursor-pointer hover:border-brand-blue/40 focus-visible:shadow-(--shadow-focus) outline-none", false: "" },
    },
    defaultVariants: { variant: "default", selected: false, interactive: false },
  },
);

/** Puce : filtre actif, valeur sélectionnée, étiquette retirable. */
const Chip = withRef(function Chip({
  className,
  variant,
  selected,
  onRemove,
  onClick,
  children,
  ...props
}: Omit<React.ComponentProps<"span">, "onClick"> &
  VariantProps<typeof chipVariants> & { onRemove?: () => void; onClick?: () => void }) {
  return (
    <span
      data-slot="chip"
      data-selected={selected || undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? !!selected : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onClick()) : undefined}
      className={cn(chipVariants({ variant, selected, interactive: !!onClick }), onRemove && "pr-1", className)}
      {...props}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          aria-label="Retirer"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex size-5 cursor-pointer items-center justify-center rounded-full text-fg-tertiary hover:bg-black/8 hover:text-fg-primary dark:hover:bg-white/10"
        >
          <XIcon className="!size-3" />
        </button>
      ) : null}
    </span>
  );
});

export { Chip, chipVariants };
