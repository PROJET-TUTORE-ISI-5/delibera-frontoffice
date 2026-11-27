"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** Code à usage unique (double authentification du président de jury, confirmation de clôture). */
const InputOTP = withRef(function InputOTP({ className, containerClassName, ...props }: React.ComponentProps<typeof OTPInput> & { containerClassName?: string }) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn("flex items-center gap-2 has-disabled:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
});

const InputOTPGroup = withRef(function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="input-otp-group" className={cn("flex items-center", className)} {...props} />;
});

const InputOTPSlot = withRef(function InputOTPSlot({ index, className, ...props }: React.ComponentProps<"div"> & { index: number }) {
  const ctx = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = ctx?.slots[index] ?? {};
  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex size-10 items-center justify-center border-y border-r border-[rgba(39,39,42,0.15)] bg-bg-surface text-base font-medium tabular-nums text-fg-primary shadow-xs transition-[box-shadow,border-color] first:rounded-l-lg first:border-l last:rounded-r-lg data-[active=true]:z-10 data-[active=true]:border-brand-blue data-[active=true]:ring-3 data-[active=true]:ring-brand-blue/10 dark:border-input dark:bg-white/5",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-pulse bg-fg-primary" />
        </div>
      ) : null}
    </div>
  );
});

const InputOTPSeparator = withRef(function InputOTPSeparator(props: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" className="text-fg-quaternary" {...props}>
      <MinusIcon className="size-4" />
    </div>
  );
});

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
