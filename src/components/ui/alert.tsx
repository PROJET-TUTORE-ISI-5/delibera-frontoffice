import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** Message contextuel : info, succès, avertissement, erreur. */

const alertVariants = cva(
  "relative grid w-full grid-cols-[16px_1fr] items-start gap-x-2.5 gap-y-0.5 rounded-(--radius-row) border px-3.5 py-3 text-sm [&>svg]:mt-0.5 [&>svg]:size-4",
  {
    variants: {
      variant: {
        info: "border-[#0082fb]/20 bg-status-info-soft text-fg-ink [&>svg]:text-status-info",
        success: "border-status-success/20 bg-status-success-soft text-fg-ink [&>svg]:text-status-success",
        warning: "border-status-warning/25 bg-status-warning-soft text-fg-ink [&>svg]:text-badge-orange",
        danger: "border-status-danger/20 bg-status-danger-soft text-fg-ink [&>svg]:text-status-danger",
        neutral: "border-border-subtle bg-bg-surface text-fg-ink [&>svg]:text-fg-tertiary",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

const ICONS = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: XCircle, neutral: Info };

const Alert = withRef(function Alert({ className, variant, icon, children, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants> & { icon?: React.ReactNode | false }) {
  const Icon = ICONS[variant ?? "info"];
  return (
    <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {icon === false ? null : icon ?? <Icon />}
      <div className={cn("flex flex-col gap-0.5", icon === false ? "col-span-2" : "col-start-2")}>{children}</div>
    </div>
  );
});

const AlertTitle = withRef(function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("font-medium tracking-tight text-fg-primary", className)} {...props} />;
});

const AlertDescription = withRef(function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn("text-sm text-fg-secondary [&_p]:leading-relaxed", className)} {...props} />;
});

export { Alert, AlertTitle, AlertDescription, alertVariants };
