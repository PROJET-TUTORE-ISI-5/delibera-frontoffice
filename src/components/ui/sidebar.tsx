import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** Barre latérale d'application (236px). Composition simple : Sidebar > SidebarHeader / SidebarContent > SidebarGroup > SidebarMenu > SidebarMenuItem > SidebarMenuButton. */
const Sidebar = withRef(function Sidebar({ className, ...props }: React.ComponentProps<"aside">) {
  return (
    <aside
      data-slot="sidebar"
      className={cn("flex h-full w-(--sidebar-w,236px) shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground", className)}
      {...props}
    />
  );
});

const SidebarHeader = withRef(function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-header" className={cn("flex h-16 shrink-0 items-center gap-2 px-4", className)} {...props} />;
});

const SidebarContent = withRef(function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-content" className={cn("flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 py-2", className)} {...props} />;
});

const SidebarFooter = withRef(function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-footer" className={cn("mt-auto flex flex-col gap-2 border-t border-sidebar-border p-2", className)} {...props} />;
});

const SidebarGroup = withRef(function SidebarGroup({ className, label, children, ...props }: React.ComponentProps<"div"> & { label?: React.ReactNode }) {
  return (
    <div data-slot="sidebar-group" className={cn("flex flex-col gap-1", className)} {...props}>
      {label ? <p className="px-2 pb-1 text-xs font-medium text-fg-tertiary">{label}</p> : null}
      {children}
    </div>
  );
});

const SidebarMenu = withRef(function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="sidebar-menu" className={cn("flex flex-col gap-0.5", className)} {...props} />;
});

const SidebarMenuItem = withRef(function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-item" className={cn("relative", className)} {...props} />;
});

const SidebarMenuButton = withRef(function SidebarMenuButton({
  asChild,
  isActive,
  className,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean; isActive?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="sidebar-menu-button"
      data-active={isActive || undefined}
      className={cn(
        "flex h-8 w-full cursor-pointer items-center gap-2 rounded-(--radius-row) px-2 text-left text-sm font-medium tracking-tight text-fg-secondary outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:shadow-(--shadow-focus) data-[active=true]:bg-bg-surface data-[active=true]:text-fg-primary data-[active=true]:shadow-(--shadow-card) dark:data-[active=true]:bg-white/8 [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",
        className,
      )}
      {...props}
    />
  );
});

const SidebarMenuBadge = withRef(function SidebarMenuBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="sidebar-menu-badge"
      className={cn("pointer-events-none absolute top-1.5 right-2 flex h-5 min-w-5 items-center justify-center rounded-md bg-black/6 px-1 text-xs font-medium tabular-nums text-fg-secondary dark:bg-white/10", className)}
      {...props}
    />
  );
});

/** Mise en page : barre latérale + zone principale. */
const SidebarLayout = withRef(function SidebarLayout({ className, sidebar, children, ...props }: React.ComponentProps<"div"> & { sidebar: React.ReactNode }) {
  return (
    <div data-slot="sidebar-layout" className={cn("flex h-svh w-full bg-bg-app", className)} {...props}>
      {sidebar}
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
});

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuBadge, SidebarLayout };
