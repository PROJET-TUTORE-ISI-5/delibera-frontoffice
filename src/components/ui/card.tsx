import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** Carte avec en-tête, contenu, pied et action. */

const cardVariants = cva(
  "group/card flex flex-col gap-6 overflow-hidden rounded-xl text-sm text-card-foreground data-[size=sm]:gap-4",
  {
    variants: {
      variant: {
        default: "bg-bg-surface shadow-(--shadow-card)",
        elevated: "bg-bg-surface shadow-lg shadow-black/10",
        outline: "bg-bg-surface shadow-xs ring-1 ring-foreground/10",
        ghost: "bg-transparent shadow-none",
      },
      size: {
        default: "py-6",
        sm: "py-4",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

const Card = withRef(function Card({ className, variant, size = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return <div data-slot="card" data-size={size} className={cn(cardVariants({ variant, size }), className)} {...props} />;
});

const CardHeader = withRef(function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min items-start gap-1 px-6 group-data-[size=sm]/card:px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className,
      )}
      {...props}
    />
  );
});

const CardTitle = withRef(function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-title" className={cn("text-base leading-normal font-medium text-fg-primary group-data-[size=sm]/card:text-sm", className)} {...props} />;
});

const CardDescription = withRef(function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-description" className={cn("text-sm text-muted-foreground", className)} {...props} />;
});

const CardAction = withRef(function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-action" className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)} {...props} />;
});

const CardContent = withRef(function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-6 group-data-[size=sm]/card:px-4", className)} {...props} />;
});

const CardFooter = withRef(function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex w-full items-center gap-2 px-6 group-data-[size=sm]/card:px-4", className)} {...props} />;
});

export { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter, cardVariants };
