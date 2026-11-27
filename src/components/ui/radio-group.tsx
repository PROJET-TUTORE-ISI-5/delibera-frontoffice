"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** Boutons radio 18 px (charte) : choix unique parmi quelques options. */

const RadioGroup = withRef(function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn("grid gap-2.5", className)} {...props} />;
});

const RadioGroupItem = withRef(function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "peer flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-[rgba(39,39,42,0.25)] bg-bg-surface shadow-xs outline-none transition-[border-color,box-shadow] focus-visible:shadow-(--shadow-focus) disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[#d42422] data-[state=checked]:border-brand-blue data-[state=checked]:bg-brand-blue dark:border-white/25 dark:bg-white/5 dark:data-[state=checked]:border-brand-blue dark:data-[state=checked]:bg-brand-blue dark:data-[state=indeterminate]:bg-brand-blue",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator data-slot="radio-group-indicator" className="flex items-center justify-center">
        <span className="size-2 rounded-full bg-white" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});

export { RadioGroup, RadioGroupItem };
