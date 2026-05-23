import * as React from "react";

type BadgeVariant = "quoting" | "scheduled" | "in_progress" | "complete" | "cancelled" | "rush" | "default";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  quoting: "bg-status-quoting/15 text-status-quoting border-status-quoting/30",
  scheduled: "bg-status-scheduled/15 text-status-scheduled border-status-scheduled/30",
  in_progress: "bg-status-in-progress/15 text-status-in-progress border-status-in-progress/30",
  complete: "bg-status-complete/15 text-status-complete border-status-complete/30",
  cancelled: "bg-status-cancelled/15 text-status-cancelled border-status-cancelled/30",
  rush: "bg-status-rush/15 text-status-rush border-status-rush/30",
  default: "bg-muted text-muted-foreground border-border",
};

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-md border px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
