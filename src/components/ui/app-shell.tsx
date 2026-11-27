import * as React from "react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/**
 * Coquille d'application (charte : barre supérieure, fil d'Ariane, filtres en tête, tableau central).
 * <AppShell topbar={<Topbar … />} sidebar={<Sidebar … />}> contenu </AppShell>
 */
const AppShell = withRef(function AppShell({
  className,
  topbar,
  sidebar,
  children,
  ...props
}: React.ComponentProps<"div"> & { topbar?: React.ReactNode; sidebar?: React.ReactNode }) {
  return (
    <div data-slot="app-shell" className={cn("flex h-svh flex-col bg-bg-app text-fg-primary", className)} {...props}>
      {topbar}
      <div className="flex min-h-0 flex-1">
        {sidebar}
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
});

/** Barre supérieure : `brand` (bleue, charte) ou `surface` (blanche). */
const Topbar = withRef(function Topbar({
  className,
  variant = "brand",
  start,
  center,
  end,
  ...props
}: React.ComponentProps<"header"> & { variant?: "brand" | "surface"; start?: React.ReactNode; center?: React.ReactNode; end?: React.ReactNode }) {
  return (
    <header
      data-slot="topbar"
      data-variant={variant}
      className={cn(
        "flex h-(--navbar-h,64px) shrink-0 items-center gap-4 px-4 sm:px-6",
        variant === "brand" ? "bg-brand-blue-press text-white" : "border-b border-border-subtle bg-bg-surface text-fg-primary",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-3">{start}</div>
      <div className="flex min-w-0 flex-1 items-center justify-center">{center}</div>
      <div className="flex shrink-0 items-center gap-2">{end}</div>
    </header>
  );
});

/** Contenu de page centré avec marges. */
const PageContainer = withRef(function PageContainer({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="page-container" className={cn("mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 sm:p-6", className)} {...props} />;
});

export { AppShell, Topbar, PageContainer };
