import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** Boutons : principal (dégradé bleu), secondaire, ghost, soft, dashed, destructive, success… hauteur 36 px, coins 6 px. */

const focusRing = "focus-visible:border-transparent focus-visible:shadow-(--shadow-focus)";
const destructiveFocusRing =
  "focus-visible:border-transparent focus-visible:shadow-[0_1px_2px_0_rgba(0,0,0,0.05),0_0_0_1px_white,0_0_0_3px_rgba(238,110,108,0.4)]";
/** Désactivé : voile neutre + encre à 30 %, jamais une simple opacité. */
const surfaceDisabled =
  "disabled:border-transparent disabled:bg-black/8 disabled:bg-none disabled:text-[rgba(39,39,42,0.3)] disabled:shadow-none disabled:[text-shadow:none] dark:disabled:bg-white/8 dark:disabled:text-white/35";
const borderedDisabled = cn(surfaceDisabled, "disabled:border-black/10 dark:disabled:border-white/10");
const ghostDisabled =
  "disabled:bg-transparent disabled:text-[rgba(39,39,42,0.3)] disabled:shadow-none dark:disabled:text-white/35";

const blueGradient = "bg-[linear-gradient(0deg,var(--brand-blue-press)_0%,var(--brand-blue-light)_100%)]";
const glossy =
  "border-[rgba(32,32,32,0.35)] text-white shadow-[inset_0_0_7.2px_0_rgba(255,255,255,0.69)] [text-shadow:0_0.5px_1px_rgba(0,0,0,0.15)]";

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 overflow-hidden rounded-(--radius-input) border border-transparent bg-clip-padding text-sm font-medium tracking-tight whitespace-nowrap outline-none select-none transition-[color,background-color,box-shadow,border-color,filter] disabled:pointer-events-none disabled:cursor-not-allowed data-[loading=true]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: cn(glossy, blueGradient, "hover:brightness-110 active:brightness-90", focusRing, surfaceDisabled),
        secondary: cn(
          "border-border-subtle bg-bg-surface text-fg-primary shadow-(--shadow-button) hover:bg-[#fafafa] active:bg-[#f4f4f5] dark:bg-white/5 dark:hover:bg-white/8",
          focusRing,
          borderedDisabled,
        ),
        ghost: cn("bg-transparent text-fg-primary hover:bg-black/6 active:bg-black/8 dark:hover:bg-white/8", focusRing, ghostDisabled),
        "ghost-muted": cn("bg-transparent text-fg-tertiary hover:bg-black/6 active:bg-black/8 dark:hover:bg-white/8", focusRing, ghostDisabled),
        soft: cn("bg-black/6 text-fg-secondary hover:bg-black/8 active:bg-black/10 dark:bg-white/8 dark:text-muted-foreground", focusRing, surfaceDisabled),
        dashed: cn(
          "border-dashed border-[rgba(39,39,42,0.15)] bg-bg-surface text-fg-primary hover:bg-[#fafafa] dark:border-white/15 dark:bg-white/5",
          focusRing,
          borderedDisabled,
        ),
        destructive: cn("bg-[#e74341] text-white shadow-(--shadow-button) hover:bg-[#ed6664]", destructiveFocusRing, surfaceDisabled),
        brand: cn("rounded-(--radius-button) bg-brand-blue text-white hover:bg-brand-blue-press", focusRing, surfaceDisabled),
        success: cn("rounded-(--radius-button) bg-status-success text-white hover:brightness-95", focusRing, surfaceDisabled),
        warning: cn(glossy, "bg-[#f8b12d] hover:brightness-103 active:brightness-95", focusRing, surfaceDisabled),
        "blue-soft": cn("rounded-(--radius-button) bg-brand-blue-soft text-brand-blue-deep hover:bg-[#e7ecff] dark:hover:bg-brand-blue/25", focusRing, surfaceDisabled),
        "neutral-solid": cn(glossy, "bg-[linear-gradient(21.5deg,#111115_22.87%,#585872_101.6%)] hover:brightness-125", focusRing, surfaceDisabled),
        link: cn("text-primary underline-offset-4 hover:underline", ghostDisabled),
      },
      size: {
        xs: "h-6 rounded-[8px] px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-[10px] px-2.5",
        md: "h-9 px-2.5",
        lg: "h-10 gap-1.5 px-2.5",
        icon: "size-9 p-0",
      },
      shape: {
        rounded: "",
        pill: "rounded-full",
      },
    },
    defaultVariants: { variant: "secondary", size: "md", shape: "rounded" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Affiche un spinner, garde la largeur et bloque les clics. */
    loading?: boolean;
  };

const Button = withRef(function Button({ className, variant, size, shape, loading = false, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      data-slot="button"
      data-variant={variant ?? "secondary"}
      data-loading={loading ? "true" : undefined}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, shape }), className)}
      {...props}
    >
      <span
        data-slot="button-label"
        className={cn(
          "inline-flex items-center justify-center gap-[inherit] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          loading && "-translate-y-1.5 opacity-0",
        )}
      >
        {children}
      </span>
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </span>
      ) : null}
    </button>
  );
});

export { Button, buttonVariants, type ButtonProps };
