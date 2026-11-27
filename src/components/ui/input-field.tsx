import * as React from "react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input, type InputProps } from "@/components/ui/input";

/** Input prêt à l'emploi avec libellé, aide et erreur (raccourci de Field + Input). */
const InputField = withRef(function InputField({
  label,
  description,
  error,
  required,
  id,
  className,
  ...props
}: InputProps & { label: React.ReactNode; description?: React.ReactNode; error?: React.ReactNode }) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <Field invalid={!!error} disabled={props.disabled} className={className}>
      <FieldLabel htmlFor={inputId} required={required}>{label}</FieldLabel>
      <Input id={inputId} required={required} aria-invalid={!!error || undefined} aria-describedby={description ? `${inputId}-desc` : undefined} {...props} />
      {description && !error ? <FieldDescription id={`${inputId}-desc`}>{description}</FieldDescription> : null}
      <FieldError>{error}</FieldError>
    </Field>
  );
});

export { InputField };
