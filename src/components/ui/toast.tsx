"use client";

import * as React from "react";
import { Toaster as Sonner, toast, type ToasterProps } from "sonner";
import { CheckCircle2, Info, Loader2, AlertTriangle, XCircle } from "lucide-react";

/** Notifications éphémères (sonner) : placer <Toaster /> une fois, puis toast.success("Notes enregistrées"). */

/** Place <Toaster /> une fois dans le layout, puis appelle toast.success("Notes enregistrées"). */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      icons={{
        success: <CheckCircle2 className="size-4 text-status-success" />,
        info: <Info className="size-4 text-status-info" />,
        warning: <AlertTriangle className="size-4 text-badge-orange" />,
        error: <XCircle className="size-4 text-status-danger" />,
        loading: <Loader2 className="size-4 animate-spin text-fg-tertiary" />,
      }}
      toastOptions={{
        classNames: {
          toast: "!rounded-(--radius-row) !border !border-border-subtle !bg-popover !text-popover-foreground !shadow-(--shadow-pop) !font-sans !gap-2.5",
          title: "!text-sm !font-medium !tracking-tight",
          description: "!text-sm !text-fg-tertiary",
          actionButton: "!bg-brand-blue !text-white !rounded-md",
          cancelButton: "!bg-black/6 !text-fg-secondary !rounded-md",
        },
      }}
      {...props}
    />
  );
}

export { Toaster, toast };
