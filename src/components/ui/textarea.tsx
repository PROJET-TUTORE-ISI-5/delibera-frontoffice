import * as React from "react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** Zone de texte multiligne (motif de décision, observations). */

const Textarea = withRef(function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full min-w-0 resize-y rounded-lg border border-[rgba(39,39,42,0.15)] bg-bg-surface px-2.5 py-2 text-sm leading-5 tracking-tight text-fg-primary shadow-xs outline-none transition-[color,box-shadow,border-color] placeholder:text-[#a1a1a9] focus-visible:border-brand-blue focus-visible:ring-3 focus-visible:ring-brand-blue/10 disabled:cursor-not-allowed disabled:border-black/6 disabled:bg-neutral-100 disabled:text-fg-tertiary aria-invalid:border-[#d42422] aria-invalid:ring-3 aria-invalid:ring-[#d42422]/20 dark:border-input dark:bg-white/5 dark:disabled:bg-white/5",
        className,
      )}
      {...props}
    />
  );
});

export { Textarea };
