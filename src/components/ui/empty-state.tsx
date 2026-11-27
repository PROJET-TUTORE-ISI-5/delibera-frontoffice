import * as React from "react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** État vide : aucune note saisie, aucun résultat de recherche… */
const EmptyState = withRef(function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn("flex flex-col items-center justify-center gap-3 rounded-(--radius-card) border border-dashed border-[rgba(39,39,42,0.15)] px-6 py-10 text-center dark:border-white/15", className)}
      {...props}
    >
      {icon ? (
        <div className="flex size-10 items-center justify-center rounded-(--radius-row) bg-bg-surface text-fg-tertiary shadow-(--shadow-card) [&_svg]:size-5">{icon}</div>
      ) : null}
      <div className="space-y-1">
        <p className="text-sm font-medium text-fg-primary">{title}</p>
        {description ? <p className="max-w-sm text-sm text-fg-tertiary">{description}</p> : null}
      </div>
      {action ? <div className="mt-1 flex gap-2">{action}</div> : null}
    </div>
  );
});

export { EmptyState };
