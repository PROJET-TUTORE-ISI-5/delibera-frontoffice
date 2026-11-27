import * as React from "react";
import { Gavel } from "lucide-react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** Logo de l'application : pictogramme + nom. Le nom est un texte (à remplacer par le logo définitif). */
const BrandLogo = withRef(function BrandLogo({
  className,
  name = "Délibéra",
  variant = "full",
  size = "md",
  inverse,
  ...props
}: React.ComponentProps<"div"> & { name?: string; variant?: "full" | "mark"; size?: "sm" | "md" | "lg"; inverse?: boolean }) {
  const box = { sm: "size-5 rounded-[5px] [&_svg]:size-3", md: "size-7 rounded-md [&_svg]:size-4", lg: "size-9 rounded-(--radius-row) [&_svg]:size-5" }[size];
  const text = { sm: "text-sm", md: "text-base", lg: "text-xl" }[size];
  return (
    <div data-slot="brand-logo" className={cn("inline-flex shrink-0 items-center gap-2", className)} {...props}>
      <span className={cn("flex items-center justify-center", inverse ? "bg-white text-brand-blue" : "bg-brand-blue text-white", box)}>
        <Gavel />
      </span>
      {variant === "full" ? <span className={cn("font-semibold tracking-tight", inverse ? "text-white" : "text-fg-primary", text)}>{name}</span> : <span className="sr-only">{name}</span>}
    </div>
  );
});

export { BrandLogo };
