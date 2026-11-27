"use client";

import * as React from "react";
import { ChevronsUpDownIcon, LogOutIcon, MoonIcon, UserIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const initials = (n: string) => n.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

/** Utilisateur connecté + menu (profil, thème, déconnexion) ; dans la barre latérale ou la barre supérieure. */
function NavUser({
  name,
  role,
  email,
  avatar,
  onProfile,
  onToggleTheme,
  onLogout,
  compact,
  inverse,
  className,
}: {
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  onProfile?: () => void;
  onToggleTheme?: () => void;
  onLogout?: () => void;
  compact?: boolean;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-(--radius-row) p-1.5 text-left outline-none transition-colors focus-visible:shadow-(--shadow-focus)",
          inverse ? "text-white hover:bg-white/10" : "hover:bg-black/6 dark:hover:bg-white/8",
          !compact && "w-full",
          className,
        )}
      >
        <Avatar size="sm">
          {avatar ? <AvatarImage src={avatar} alt="" /> : null}
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        <div className={cn("min-w-0 flex-1 text-xs", compact && "hidden sm:block")}>
          <p className="truncate font-medium">{name}</p>
          <p className={cn("truncate", inverse ? "text-white/70" : "text-fg-tertiary")}>{role}</p>
        </div>
        <ChevronsUpDownIcon className={cn("size-4 shrink-0", inverse ? "text-white/70" : "text-fg-tertiary")} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium text-fg-primary">{name}</p>
          <p className="text-xs text-fg-tertiary">{email ?? role}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onProfile ? <DropdownMenuItem onSelect={onProfile}><UserIcon />Mon profil</DropdownMenuItem> : null}
        {onToggleTheme ? <DropdownMenuItem onSelect={onToggleTheme}><MoonIcon />Changer de thème</DropdownMenuItem> : null}
        {onLogout ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={onLogout}><LogOutIcon />Se déconnecter</DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { NavUser };
