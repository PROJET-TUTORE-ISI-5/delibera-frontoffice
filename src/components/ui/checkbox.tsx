"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { CheckIcon, MinusIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** Case à cocher 18 px, cochage en bleu (charte), avec état indéterminé. */

const Checkbox = withRef(function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-(--radius-control) border border-[rgba(39,39,42,0.25)] bg-bg-surface shadow-xs outline-none transition-[background-color,border-color,box-shadow] focus-visible:shadow-(--shadow-focus) disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[#d42422] data-[state=checked]:border-brand-blue data-[state=checked]:bg-brand-blue data-[state=checked]:text-white data-[state=indeterminate]:border-brand-blue data-[state=indeterminate]:bg-brand-blue data-[state=indeterminate]:text-white dark:border-white/25 dark:bg-white/5 dark:data-[state=checked]:border-brand-blue dark:data-[state=checked]:bg-brand-blue dark:data-[state=indeterminate]:bg-brand-blue",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex items-center justify-center">
        {props.checked === "indeterminate" ? <MinusIcon className="size-3.5" strokeWidth={3} /> : <CheckIcon className="size-3.5" strokeWidth={3} />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

export { Checkbox };
