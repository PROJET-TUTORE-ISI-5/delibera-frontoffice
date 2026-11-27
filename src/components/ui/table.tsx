import * as React from "react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** Tableau de données (relevés de notes, PV). Conteneur avec défilement horizontal. */
const Table = withRef(function Table({
  className,
  containerClassName,
  striped = true,
  stickyHeader = false,
  containerStyle,
  ...props
}: React.ComponentProps<"table"> & {
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  /** Lignes alternées (charte). */
  striped?: boolean;
  /** En-tête fixe au défilement : donner une hauteur max au conteneur (containerClassName="max-h-[480px]"). */
  stickyHeader?: boolean;
}) {
  return (
    <div
      data-slot="table-container"
      data-striped={striped || undefined}
      data-sticky={stickyHeader || undefined}
      style={containerStyle}
      className={cn(
        "group/table relative w-full overflow-auto rounded-(--radius-card) bg-bg-surface shadow-(--shadow-card)",
        containerClassName,
      )}
    >
      <table data-slot="table" className={cn("w-full caption-bottom border-collapse text-sm", className)} {...props} />
    </div>
  );
});

const TableHeader = withRef(function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead
      data-slot="table-header"
      className={cn(
        "bg-bg-inset [&_tr]:border-b [&_tr]:border-border-divider group-data-[sticky=true]/table:sticky group-data-[sticky=true]/table:top-0 group-data-[sticky=true]/table:z-10",
        className,
      )}
      {...props}
    />;
});

const TableBody = withRef(function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0 group-data-[striped=true]/table:[&_tr:nth-child(even)]:bg-bg-inset/60", className)}
      {...props}
    />;
});

const TableFooter = withRef(function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return <tfoot data-slot="table-footer" className={cn("border-t border-border-divider bg-bg-inset font-medium", className)} {...props} />;
});

const TableRow = withRef(function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn("border-b border-border-divider transition-colors hover:bg-brand-blue-tint data-[state=selected]:bg-brand-blue-soft", className)}
      {...props}
    />
  );
});

const TableHead = withRef(function TableHead({ className, numeric, ...props }: React.ComponentProps<"th"> & { numeric?: boolean }) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-3 text-left align-middle text-xs font-medium whitespace-nowrap text-fg-tertiary [&:has([role=checkbox])]:w-8 [&:has([role=checkbox])]:pr-0",
        numeric && "text-right",
        className,
      )}
      {...props}
    />
  );
});

const TableCell = withRef(function TableCell({ className, numeric, ...props }: React.ComponentProps<"td"> & { numeric?: boolean }) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "h-11 px-3 align-middle whitespace-nowrap text-fg-ink [&:has([role=checkbox])]:pr-0",
        numeric && "text-right tabular-nums",
        className,
      )}
      {...props}
    />
  );
});

const TableCaption = withRef(function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("py-3 text-xs text-fg-tertiary", className)} {...props} />;
});

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
