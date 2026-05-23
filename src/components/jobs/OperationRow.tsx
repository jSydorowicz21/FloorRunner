import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Clock } from "lucide-react";

export type OpStatus = "pending" | "in_progress" | "complete";

interface OperationRowProps {
  opNumber: number;
  description: string;
  machineName?: string;
  operatorName?: string;
  status: OpStatus;
  notes?: string;
  elapsedTime?: string; // e.g. "1h 23m"
}

const statusConfig: Record<OpStatus, { bg: string; label: string; badgeVariant: "default" | "in_progress" | "complete" }> = {
  pending: { bg: "bg-muted/40", label: "Pending", badgeVariant: "default" },
  in_progress: { bg: "bg-status-in-progress/15", label: "In Progress", badgeVariant: "in_progress" },
  complete: { bg: "bg-status-complete/15", label: "Complete", badgeVariant: "complete" },
};

export function OperationRow({
  opNumber,
  description,
  machineName,
  operatorName,
  status,
  notes,
  elapsedTime,
}: OperationRowProps) {
  const { bg, label, badgeVariant } = statusConfig[status];

  return (
    <div className={["flex items-start gap-3 rounded-lg border border-border p-3 transition-colors", bg].join(" ")}>
      {/* Op number badge */}
      <div className="shrink-0">
        <span className={[
          "inline-flex items-center justify-center w-6 h-6 rounded-md text-2xs font-bold shrink-0",
          status === "complete" ? "bg-status-complete/20 text-status-complete" :
          status === "in_progress" ? "bg-status-in-progress/20 text-status-in-progress" :
          "bg-muted text-muted-foreground",
        ].join(" ")}>
          {opNumber}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-xs font-medium text-foreground truncate">{description}</p>
          <Badge variant={badgeVariant} className="shrink-0 text-2xs">
            {label}
          </Badge>
        </div>

        {/* Machine + operator row */}
        <div className="flex items-center gap-3 text-2xs text-muted-foreground">
          {machineName && (
            <span className="truncate">
              <span className="opacity-60">Machine:</span>{" "}
              <span className="text-foreground font-medium">{machineName}</span>
            </span>
          )}
          {operatorName && (
            <span className="truncate">
              <span className="opacity-60">Operator:</span>{" "}
              <span className="text-foreground font-medium">{operatorName}</span>
            </span>
          )}
        </div>

        {/* Notes */}
        {notes && (
          <p className="mt-1.5 text-2xs text-muted-foreground italic">{notes}</p>
        )}
      </div>

      {/* Elapsed time */}
      {elapsedTime && (
        <div className="shrink-0 flex items-center gap-1 text-2xs text-muted-foreground">
          <Clock size={10} />
          <span className="font-mono">{elapsedTime}</span>
        </div>
      )}
    </div>
  );
}
