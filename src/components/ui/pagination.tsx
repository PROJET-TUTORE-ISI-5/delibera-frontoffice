import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";
import { buttonVariants } from "@/components/ui/button";

/** Pagination de liste (charte : 50 lignes par page). */

const Pagination = withRef(function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav role="navigation" aria-label="Pagination" data-slot="pagination" className={cn("mx-auto flex w-full justify-center", className)} {...props} />;
});

const PaginationContent = withRef(function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="pagination-content" className={cn("flex flex-row items-center gap-1", className)} {...props} />;
});

const PaginationItem = withRef(function PaginationItem(props: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
});

const PaginationLink = withRef(function PaginationLink({ className, isActive, ...props }: React.ComponentProps<"a"> & { isActive?: boolean }) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(buttonVariants({ variant: isActive ? "secondary" : "ghost", size: "sm" }), "min-w-8 justify-center tabular-nums", className)}
      {...props}
    />
  );
});

const PaginationPrevious = withRef(function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Page précédente" className={cn("gap-1 pl-2", className)} {...props}>
      <ChevronLeftIcon />
      <span className="hidden sm:block">Précédent</span>
    </PaginationLink>
  );
});

const PaginationNext = withRef(function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Page suivante" className={cn("gap-1 pr-2", className)} {...props}>
      <span className="hidden sm:block">Suivant</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
});

const PaginationEllipsis = withRef(function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span aria-hidden data-slot="pagination-ellipsis" className={cn("flex size-8 items-center justify-center text-fg-tertiary", className)} {...props}>
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">Plus de pages</span>
    </span>
  );
});

export { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis };
