import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Clock, Zap } from "lucide-react";

export type JobPriority = "normal" | "rush";
export type JobDueState = "normal" | "due_today" | "overdue";

export interface Job {
  id: string;
  jobNumber: string;
  customerName: string;
  partDescription: string;
  currentOperation?: string;
  operatorAvatarUrl?: string;
  operatorInitials?: string;
  progress?: number; // 0–100
  dueDate?: string; // ISO date string
  priority: JobPriority;
}

interface JobCardProps {
  job: Job;
  onClick?: () => void;
  isDragging?: boolean;
}

function getDueState(dueDate?: string, priority?: JobPriority): JobDueState {
  if (!dueDate) return "normal";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  if (due < today) return "overdue";
  if (due.getTime() === today.getTime()) return "due_today";
  return "normal";
}

const dueStateBorderColors: Record<JobDueState, string> = {
  normal: "border-border",
  due_today: "border-l-4 border-l-status-quoting border-t-border border-r-border border-b-border",
  overdue: "border-l-4 border-l-destructive border-t-border border-r-border border-b-border",
};

export function JobCard({ job, onClick, isDragging = false }: JobCardProps) {
  const dueState = getDueState(job.dueDate, job.priority);

  return (
    <Card
      className={[
        "p-3 cursor-pointer select-none transition-all border",
        dueStateBorderColors[dueState],
        isDragging ? "opacity-50 scale-95 shadow-lg" : "hover:shadow-md hover:border-primary/40",
        job.priority === "rush" ? "ring-1 ring-status-rush/30" : "",
      ].join(" ")}
      onClick={onClick}
    >
      {/* Rush badge */}
      {job.priority === "rush" && (
        <div className="flex items-center gap-1 mb-2">
          <Zap size={11} className="text-status-rush fill-status-rush" />
          <span className="text-2xs font-bold text-status-rush uppercase tracking-wide">Rush</span>
        </div>
      )}

      {/* Job number */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono font-bold text-sm text-foreground">{job.jobNumber}</span>
        {job.currentOperation && (
          <Badge variant="in_progress" className="text-2xs">
            {job.currentOperation}
          </Badge>
        )}
      </div>

      {/* Customer name */}
      <p className="text-xs font-medium text-foreground mb-1 truncate">{job.customerName}</p>

      {/* Part description */}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{job.partDescription}</p>

      {/* Footer: operator + progress */}
      <div className="flex items-center justify-between mt-auto">
        {/* Operator avatar */}
        <div className="flex items-center gap-1.5">
          {job.operatorAvatarUrl ? (
            <img
              src={job.operatorAvatarUrl}
              alt={job.operatorInitials}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : job.operatorInitials ? (
            <div className="w-6 h-6 rounded-full bg-avatar-bg flex items-center justify-center">
              <span className="text-2xs font-bold text-muted-foreground">{job.operatorInitials}</span>
            </div>
          ) : null}
          {job.operatorInitials && (
            <span className="text-2xs text-muted-foreground">{job.operatorInitials}</span>
          )}
        </div>

        {/* Due date indicator */}
        {job.dueDate && (
          <div className={[
            "flex items-center gap-1 text-2xs",
            dueState === "overdue" ? "text-destructive" : dueState === "due_today" ? "text-status-quoting" : "text-muted-foreground",
          ].join(" ")}>
            <Clock size={10} />
            <span>{new Date(job.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {job.progress !== undefined && (
        <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      )}
    </Card>
  );
}
