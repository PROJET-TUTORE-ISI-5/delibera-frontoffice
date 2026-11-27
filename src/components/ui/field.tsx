import * as React from "react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";
import { Label } from "@/components/ui/label";

/** Regroupe un libellé, un contrôle, une aide et un message d'erreur. */
const Field = withRef(function Field({
  className,
  orientation = "vertical",
  invalid,
  disabled,
  ...props
}: React.ComponentProps<"div"> & { orientation?: "vertical" | "horizontal"; invalid?: boolean; disabled?: boolean }) {
  return (
    <div
      role="group"
      data-slot="field"
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        "group/field flex w-full gap-1.5",
        orientation === "vertical" ? "flex-col" : "flex-row items-center justify-between gap-3",
        className,
      )}
      {...props}
    />
  );
});

const FieldLabel = withRef(function FieldLabel({ className, required, children, ...props }: React.ComponentProps<typeof Label> & { required?: boolean }) {
  return (
    <Label data-slot="field-label" className={cn("group-data-[invalid=true]/field:text-[#d42422]", className)} {...props}>
      {children}
      {required ? <span aria-hidden className="text-destructive">*</span> : null}
    </Label>
  );
});

const FieldDescription = withRef(function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="field-description" className={cn("text-xs leading-4 text-fg-tertiary", className)} {...props} />;
});

const FieldError = withRef(function FieldError({ className, children, ...props }: React.ComponentProps<"p">) {
  if (!children) return null;
  return (
    <p data-slot="field-error" role="alert" className={cn("text-xs leading-4 font-medium text-[#d42422] dark:text-[#ff9d9b]", className)} {...props}>
      {children}
    </p>
  );
});

/** Ensemble de champs avec une légende (ex. « Notes de l'UE »). */
const FieldSet = withRef(function FieldSet({ className, legend, children, ...props }: React.ComponentProps<"fieldset"> & { legend?: React.ReactNode }) {
  return (
    <fieldset data-slot="field-set" className={cn("flex flex-col gap-4", className)} {...props}>
      {legend ? <legend className="mb-1 text-base font-semibold tracking-tight text-fg-primary">{legend}</legend> : null}
      {children}
    </fieldset>
  );
});

export { Field, FieldLabel, FieldDescription, FieldError, FieldSet };
