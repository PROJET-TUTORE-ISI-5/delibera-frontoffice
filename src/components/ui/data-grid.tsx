"use client";

import * as React from "react";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, FilterIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/** Tableau de données de la charte : lignes alternées, en-têtes fixes, tri et filtre par colonne, pagination par 50. */

type DataGridColumn<T> = {
  id: string;
  header: React.ReactNode;
  /** Valeur utilisée pour le tri et le filtre. */
  accessor: (row: T) => string | number | null | undefined;
  cell?: (row: T) => React.ReactNode;
  numeric?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
};

const norm = (s: unknown) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Tableau de données conforme à la charte : lignes alternées, en-têtes fixes, tri et filtre par colonne,
 * pagination par 50, sélection de lignes optionnelle.
 */
function DataGrid<T>({
  data,
  columns,
  getRowId,
  pageSize = 50,
  selectable = false,
  selected,
  onSelectedChange,
  onRowClick,
  maxHeight = 560,
  emptyTitle = "Aucune ligne",
  emptyDescription,
  className,
}: {
  data: T[];
  columns: DataGridColumn<T>[];
  getRowId: (row: T) => string;
  pageSize?: number;
  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  onRowClick?: (row: T) => void;
  maxHeight?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}) {
  const [sort, setSort] = React.useState<{ id: string; dir: "asc" | "desc" } | null>(null);
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [page, setPage] = React.useState(0);
  const [innerSel, setInnerSel] = React.useState<string[]>([]);
  const sel = new Set(selected ?? innerSel);
  const setSel = (s: Set<string>) => {
    setInnerSel([...s]);
    onSelectedChange?.([...s]);
  };

  const rows = React.useMemo(() => {
    let r = data.filter((row) =>
      Object.entries(filters).every(([id, q]) => {
        if (!q) return true;
        const col = columns.find((c) => c.id === id);
        return col ? norm(col.accessor(row)).includes(norm(q)) : true;
      }),
    );
    if (sort) {
      const col = columns.find((c) => c.id === sort.id);
      if (col) {
        r = [...r].sort((a, b) => {
          const x = col.accessor(a);
          const y = col.accessor(b);
          const cmp = typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""), "fr", { numeric: true });
          return sort.dir === "asc" ? cmp : -cmp;
        });
      }
    }
    return r;
  }, [data, filters, sort, columns]);

  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pages - 1);
  const visible = rows.slice(current * pageSize, current * pageSize + pageSize);
  const visibleIds = visible.map(getRowId);
  const allOn = visibleIds.length > 0 && visibleIds.every((id) => sel.has(id));
  const someOn = visibleIds.some((id) => sel.has(id));

  const cycleSort = (id: string) =>
    setSort((s) => (!s || s.id !== id ? { id, dir: "asc" } : s.dir === "asc" ? { id, dir: "desc" } : null));

  return (
    <div data-slot="data-grid" className={cn("space-y-3", className)}>
      <Table stickyHeader containerStyle={{ maxHeight }}>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {selectable ? (
              <TableHead>
                <Checkbox
                  aria-label="Sélectionner la page"
                  checked={allOn ? true : someOn ? "indeterminate" : false}
                  onCheckedChange={() => {
                    const next = new Set(sel);
                    visibleIds.forEach((id) => (allOn ? next.delete(id) : next.add(id)));
                    setSel(next);
                  }}
                />
              </TableHead>
            ) : null}
            {columns.map((c) => {
              const active = sort?.id === c.id;
              const SortIcon = !active ? ArrowUpDownIcon : sort!.dir === "asc" ? ArrowUpIcon : ArrowDownIcon;
              return (
                <TableHead key={c.id} numeric={c.numeric} className={c.className} aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined}>
                  <div className={cn("flex items-center gap-1", c.numeric && "justify-end")}>
                    {c.sortable !== false ? (
                      <button type="button" onClick={() => cycleSort(c.id)} className={cn("-mx-1 inline-flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 hover:text-fg-primary", active && "text-fg-primary")}>
                        {c.header}
                        <SortIcon className={cn("size-3", !active && "opacity-40")} />
                      </button>
                    ) : (
                      c.header
                    )}
                    {c.filterable ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button type="button" aria-label={`Filtrer ${typeof c.header === "string" ? c.header : c.id}`} className={cn("flex size-5 cursor-pointer items-center justify-center rounded hover:bg-black/6", filters[c.id] ? "text-brand-blue" : "opacity-40 hover:opacity-100")}>
                            <FilterIcon className="size-3" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-56 p-2">
                          <Input
                            size="sm"
                            autoFocus
                            placeholder="Contient…"
                            value={filters[c.id] ?? ""}
                            onChange={(e) => {
                              setFilters((f) => ({ ...f, [c.id]: e.target.value }));
                              setPage(0);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    ) : null}
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((row) => {
            const id = getRowId(row);
            return (
              <TableRow key={id} data-state={sel.has(id) ? "selected" : undefined} className={onRowClick ? "cursor-pointer" : undefined} onClick={onRowClick ? () => onRowClick(row) : undefined}>
                {selectable ? (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      aria-label={`Sélectionner ${id}`}
                      checked={sel.has(id)}
                      onCheckedChange={() => {
                        const next = new Set(sel);
                        if (next.has(id)) next.delete(id);
                        else next.add(id);
                        setSel(next);
                      }}
                    />
                  </TableCell>
                ) : null}
                {columns.map((c) => (
                  <TableCell key={c.id} numeric={c.numeric} className={c.className}>
                    {c.cell ? c.cell(row) : (c.accessor(row) ?? "—")}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {rows.length === 0 ? <EmptyState title={emptyTitle} description={emptyDescription} /> : null}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-fg-tertiary">
        <span className="tabular-nums">
          {rows.length ? `${current * pageSize + 1}–${Math.min(rows.length, (current + 1) * pageSize)} sur ${rows.length}` : "0 ligne"}
          {selectable && sel.size ? ` · ${sel.size} sélectionné${sel.size > 1 ? "s" : ""}` : ""}
        </span>
        {pages > 1 ? (
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" aria-disabled={current === 0} onClick={(e) => (e.preventDefault(), setPage(Math.max(0, current - 1)))} />
              </PaginationItem>
              {Array.from({ length: pages }, (_, i) => i)
                .filter((i) => i === 0 || i === pages - 1 || Math.abs(i - current) <= 1)
                .map((i) => (
                  <PaginationItem key={i}>
                    <PaginationLink href="#" isActive={i === current} onClick={(e) => (e.preventDefault(), setPage(i))}>{i + 1}</PaginationLink>
                  </PaginationItem>
                ))}
              <PaginationItem>
                <PaginationNext href="#" aria-disabled={current === pages - 1} onClick={(e) => (e.preventDefault(), setPage(Math.min(pages - 1, current + 1)))} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </div>
    </div>
  );
}

export { DataGrid, type DataGridColumn };
