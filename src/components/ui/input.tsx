"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** Champ de saisie : contour gris 1 px, bleu au focus, erreur rouge (charte) ; éléments avant/après (« / 20 »). */

const inputSurfaceVariants = cva(
  "flex w-full min-w-0 items-center gap-1.5 rounded-lg px-2 shadow-xs transition-[color,box-shadow,border-color] focus-within:border-brand-blue focus-within:ring-3 focus-within:ring-brand-blue/10 has-disabled:pointer-events-none has-disabled:border-black/6 has-disabled:bg-neutral-100 has-aria-invalid:border-[#d42422] has-aria-invalid:ring-3 has-aria-invalid:ring-[#d42422]/20 dark:has-disabled:border-white/10 dark:has-disabled:bg-white/5 dark:has-aria-invalid:ring-[#d42422]/30",
  {
    variants: {
      variant: {
        default: "border border-[rgba(39,39,42,0.15)] bg-bg-surface dark:border-input dark:bg-white/5",
        soft: "border border-transparent bg-black/6 dark:bg-white/8",
      },
      size: {
        sm: "h-8",
        lg: "h-9",
      },
    },
    defaultVariants: { variant: "default", size: "lg" },
  },
);

type InputProps = Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputSurfaceVariants> & {
    /** Élément avant le champ (icône, préfixe). */
    leftItem?: React.ReactNode;
    /** Élément après le champ (unité, ex. « / 20 »). */
    rightItem?: React.ReactNode;
  };

const Input = withRef(function Input({ className, variant, size, leftItem, rightItem, ref: forwardedRef, ...props }: InputProps) {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(forwardedRef as React.Ref<HTMLInputElement>, () => ref.current as HTMLInputElement);
  return (
    <div
      data-slot="input"
      className={cn(inputSurfaceVariants({ variant, size }), "cursor-text", className)}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          ref.current?.focus();
        }
      }}
    >
      {leftItem ? <span className="flex shrink-0 items-center whitespace-nowrap text-fg-tertiary [&_svg]:size-4">{leftItem}</span> : null}
      <input
        ref={ref}
        className={cn(
          "w-full min-w-0 bg-transparent text-fg-primary outline-none placeholder:text-[#a1a1a9] disabled:cursor-not-allowed disabled:text-fg-tertiary",
          size === "sm" ? "text-xs leading-4" : "text-sm leading-5 tracking-tight",
        )}
        {...props}
      />
      {rightItem ? <span className="flex shrink-0 items-center whitespace-nowrap text-sm text-fg-tertiary [&_svg]:size-4">{rightItem}</span> : null}
    </div>
  );
});

export { Input, type InputProps };
