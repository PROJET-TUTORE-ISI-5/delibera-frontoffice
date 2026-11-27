"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { withRef } from "@/lib/with-ref";

/** Photo ou initiales d'un utilisateur. */

const Avatar = withRef(function Avatar({ className, size = "md", ...props }: React.ComponentProps<typeof AvatarPrimitive.Root> & { size?: "sm" | "md" | "lg" }) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full ring-1 ring-black/10 dark:ring-white/10",
        size === "sm" && "size-6 text-[10px]",
        size === "md" && "size-8 text-xs",
        size === "lg" && "size-10 text-sm",
        className,
      )}
      {...props}
    />
  );
});

const AvatarImage = withRef(function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn("aspect-square size-full object-cover", className)} {...props} />;
});

const AvatarFallback = withRef(function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("flex size-full items-center justify-center bg-brand-blue-soft font-medium text-brand-blue-deep", className)}
      {...props}
    />
  );
});

export { Avatar, AvatarImage, AvatarFallback };
