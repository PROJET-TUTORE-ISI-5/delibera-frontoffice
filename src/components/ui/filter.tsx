"use client";

import * as React from "react";
import { SearchIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";

/** Barre de filtres en tête de page (charte : « filtres en tête ») : listes, recherche, puces des filtres actifs. */
const FilterBar = withRef(function FilterBar({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="filter-bar" role="search" className={cn("flex flex-wrap items-center gap-2", className)} {...props} />;
});

function FilterSearch({ value, onValueChange, placeholder = "Matricule ou nom…", className }: { value: string; onValueChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <Input
      className={cn("w-56", className)}
      value={value}
      placeholder={placeholder}
      aria-label={placeholder}
      leftItem={<SearchIcon />}
      rightItem={
        value ? (
          <button type="button" aria-label="Effacer" onClick={() => onValueChange("")} className="flex cursor-pointer items-center text-fg-tertiary hover:text-fg-primary">
            <XIcon className="!size-3.5" />
          </button>
        ) : null
      }
      onChange={(e) => onValueChange(e.target.value)}
    />
  );
}

type ActiveFilter = { id: string; label: React.ReactNode };

function ActiveFilters({ filters, onRemove, onClear, className }: { filters: ActiveFilter[]; onRemove: (id: string) => void; onClear?: () => void; className?: string }) {
  if (!filters.length) return null;
  return (
    <div data-slot="active-filters" className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {filters.map((f) => (
        <Chip key={f.id} variant="brand" onRemove={() => onRemove(f.id)}>{f.label}</Chip>
      ))}
      {onClear ? (
        <button type="button" onClick={onClear} className="cursor-pointer px-1 text-xs text-fg-tertiary hover:text-fg-primary">Tout effacer</button>
      ) : null}
    </div>
  );
}

export { FilterBar, FilterSearch, ActiveFilters, type ActiveFilter };
