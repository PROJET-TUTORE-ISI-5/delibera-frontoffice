import * as React from "react";

import { cn } from "@/lib/utils";

/** Fond décoratif (page de connexion) : dégradé du bleu de marque et grille fine. Toujours sous le contenu. */
function LinearBackground({ className, grid = true, children, ...props }: React.ComponentProps<"div"> & { grid?: boolean }) {
  return (
    <div data-slot="linear-background" className={cn("relative isolate overflow-hidden bg-bg-app", className)} {...props}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--brand-blue-soft),transparent_70%)]" />
      {grid ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)] opacity-60"
          style={{ backgroundImage: "linear-gradient(var(--border-divider) 1px, transparent 1px), linear-gradient(90deg, var(--border-divider) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
      ) : null}
      {children}
    </div>
  );
}

export { LinearBackground };
