"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** Panneau latéral (dossier étudiant à côté du tableau, filtres avancés). */
function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

const SheetTrigger = withRef(function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
});

const SheetClose = withRef(function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
});

const SheetContent = withRef(function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-bg-surface text-fg-primary shadow-(--shadow-pop) outline-none dark:ring-1 dark:ring-white/10",
          side === "right" && "inset-y-0 right-0 h-full w-3/4 border-l border-border-subtle sm:max-w-md",
          side === "left" && "inset-y-0 left-0 h-full w-3/4 border-r border-border-subtle sm:max-w-md",
          side === "top" && "inset-x-0 top-0 h-auto border-b border-border-subtle",
          side === "bottom" && "inset-x-0 bottom-0 h-auto border-t border-border-subtle",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute top-4 right-4 flex size-7 cursor-pointer items-center justify-center rounded-md text-fg-tertiary transition-colors hover:bg-black/6 hover:text-fg-primary focus-visible:shadow-(--shadow-focus) focus-visible:outline-none [&_svg]:size-4">
          <XIcon />
          <span className="sr-only">Fermer</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
});

const SheetHeader = withRef(function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1 border-b border-border-divider p-5 pr-12", className)} {...props} />;
});

const SheetBody = withRef(function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-body" className={cn("min-h-0 flex-1 overflow-y-auto px-5", className)} {...props} />;
});

const SheetFooter = withRef(function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex justify-end gap-2 border-t border-border-divider p-4", className)} {...props} />;
});

const SheetTitle = withRef(function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-base font-semibold tracking-tight", className)} {...props} />;
});

const SheetDescription = withRef(function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-sm text-fg-tertiary", className)} {...props} />;
});

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetBody, SheetFooter, SheetTitle, SheetDescription };
