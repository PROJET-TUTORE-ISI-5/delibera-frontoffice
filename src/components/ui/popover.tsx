"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** Panneau flottant ancré à un bouton. */

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

const PopoverTrigger = withRef(function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
});

const PopoverContent = withRef(function PopoverContent({ className, align = "center", sideOffset = 6, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn("z-50 w-72 rounded-(--radius-card) border border-border-subtle bg-popover p-4 text-sm text-popover-foreground shadow-(--shadow-pop) outline-none", className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});

const PopoverAnchor = withRef(function PopoverAnchor(props: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
});

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
