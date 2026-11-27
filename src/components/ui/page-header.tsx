import * as React from "react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** En-tête de page : fil d'Ariane, titre (20 px, charte), description et actions. */
const PageHeader = withRef(function PageHeader({
  className,
  breadcrumb,
  title,
  description,
  actions,
  ...props
}: Omit<React.ComponentProps<"header">, "title"> & {
  breadcrumb?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header data-slot="page-header" className={cn("flex flex-col gap-2", className)} {...props}>
      {breadcrumb}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl leading-7 font-semibold tracking-display text-fg-primary">{title}</h1>
          {description ? <p className="text-sm text-fg-tertiary">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
});

/** Barre d'actions principales en bas à droite (charte : « actions principales en bas à droite »). */
const PageActions = withRef(function PageActions({ className, start, children, ...props }: React.ComponentProps<"div"> & { start?: React.ReactNode }) {
  return (
    <div data-slot="page-actions" className={cn("flex flex-wrap items-center justify-between gap-3 border-t border-border-divider pt-4", className)} {...props}>
      <div className="text-xs text-fg-tertiary">{start}</div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
});

export { PageHeader, PageActions };
