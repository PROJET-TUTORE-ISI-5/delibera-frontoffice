"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";
import { Label } from "@/components/ui/label";

/**
 * Formulaires validés (react-hook-form + zod) : messages d'erreur sous le champ, libellés liés.
 * const form = useForm({ resolver: zodResolver(schema) }) puis <Form {...form}> … </Form>
 */
const Form = FormProvider;

type FormFieldContextValue = { name: string };
const FormFieldContext = React.createContext<FormFieldContextValue>({ name: "" });
const FormItemContext = React.createContext<{ id: string }>({ id: "" });

function FormField<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
  props: ControllerProps<TFieldValues, TName>,
) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const field = React.useContext(FormFieldContext);
  const item = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: field.name });
  const state = getFieldState(field.name, formState);
  return {
    name: field.name,
    formItemId: `${item.id}-item`,
    formDescriptionId: `${item.id}-description`,
    formMessageId: `${item.id}-message`,
    ...state,
  };
}

const FormItem = withRef(function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("flex flex-col gap-1.5", className)} {...props} />
    </FormItemContext.Provider>
  );
});

const FormLabel = withRef(function FormLabel({ className, required, children, ...props }: React.ComponentProps<typeof Label> & { required?: boolean }) {
  const { error, formItemId } = useFormField();
  return (
    <Label data-slot="form-label" data-error={!!error} htmlFor={formItemId} className={cn("data-[error=true]:text-[#d42422]", className)} {...props}>
      {children}
      {required ? <span aria-hidden className="text-destructive">*</span> : null}
    </Label>
  );
});

const FormControl = withRef(function FormControl(props: React.ComponentProps<typeof Slot.Root>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return (
    <Slot.Root
      data-slot="form-control"
      id={formItemId}
      aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
});

const FormDescription = withRef(function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();
  return <p data-slot="form-description" id={formDescriptionId} className={cn("text-xs text-fg-tertiary", className)} {...props} />;
});

const FormMessage = withRef(function FormMessage({ className, children, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? "") : children;
  if (!body) return null;
  return (
    <p data-slot="form-message" id={formMessageId} role="alert" className={cn("text-xs font-medium text-[#d42422] dark:text-[#ff9d9b]", className)} {...props}>
      {body}
    </p>
  );
});

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };
