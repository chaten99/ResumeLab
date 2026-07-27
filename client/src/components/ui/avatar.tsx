import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function Avatar({ className, children, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full border border-border bg-muted select-none items-center justify-center font-medium text-xs text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AvatarFallback({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
