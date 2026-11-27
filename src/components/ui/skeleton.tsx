import * as React from "react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** Placeholder de chargement. */

const Skeleton = withRef(function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("animate-pulse rounded-md bg-black/6 dark:bg-white/8", className)} {...props} />;
});

export { Skeleton };
