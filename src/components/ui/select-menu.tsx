"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type SelectMenuOption = { value: string; label: string; description?: string };

/** Choix rapide sous forme de bouton + menu (filtres de barre d'outils : « État : tous ▾ »). */
function SelectMenu({
  label,
  options,
  value,
  onValueChange,
  allLabel,
  className,
}: {
  label: string;
  options: SelectMenuOption[];
  value: string;
  onValueChange: (value: string) => void;
  /** Ajoute une option « tous » avec la valeur "". */
  allLabel?: string;
  className?: string;
}) {
  const opts = allLabel ? [{ value: "", label: allLabel }, ...options] : options;
  const current = opts.find((o) => o.value === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "secondary" }), "justify-between font-normal", className)}>
        <span className="truncate">
          <span className="text-fg-tertiary">{label} : </span>
          <span className="font-medium">{current?.label ?? "—"}</span>
        </span>
        <ChevronDownIcon className="text-fg-tertiary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {opts.map((o) => (
            <DropdownMenuRadioItem key={o.value || "_all"} value={o.value}>
              <div>
                <p>{o.label}</p>
                {o.description ? <p className="text-xs text-fg-tertiary">{o.description}</p> : null}
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { SelectMenu, type SelectMenuOption };
