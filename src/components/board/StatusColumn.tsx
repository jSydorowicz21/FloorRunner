"use client";

import * as React from "react";
import { JobCard, Job } from "@/components/jobs/JobCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LayoutGrid } from "lucide-react";

export type JobStatus = "quoting" | "scheduled" | "in_progress" | "complete" | "cancelled";

interface StatusColumnProps {
  status: JobStatus;
  label: string;
  jobs: Job[];
  onJobClick?: (job: Job) => void;
  isDragOver?: boolean;
}

const statusMeta: Record<JobStatus, { color: string; bg: string }> = {
  quoting: { color: "text-status-quoting", bg: "bg-status-quoting/10" },
  scheduled: { color: "text-status-scheduled", bg: "bg-status-scheduled/10" },
  in_progress: { color: "text-status-in-progress", bg: "bg-status-in-progress/10" },
  complete: { color: "text-status-complete", bg: "bg-status-complete/10" },
  cancelled: { color: "text-status-cancelled", bg: "bg-status-cancelled/10" },
};

export function StatusColumn({ status, label, jobs, onJobClick, isDragOver = false }: StatusColumnProps) {
  const meta = statusMeta[status];

  return (
    <div
      className={[
        "flex flex-col w-72 shrink-0 rounded-xl border transition-all",
        isDragOver ? "border-primary/60 bg-primary/5 ring-2 ring-primary/20" : "border-border bg-surface/50",
      ].join(" ")}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className={["text-sm font-semibold", meta.color].join(" ")}>{label}</span>
          <span className={["inline-flex items-center justify-center w-5 h-5 rounded-md text-2xs font-bold", meta.bg, meta.color].join(" ")}>
            {jobs.length}
          </span>
        </div>
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[100px]">
        {jobs.length === 0 ? (
          <div className="flex items-center justify-center h-20 rounded-lg border border-dashed border-border">
            <span className="text-2xs text-muted-foreground">Drop jobs here</span>
          </div>
        ) : (
          jobs.map((job) => (
            <JobCard key={job.id} job={job} onClick={() => onJobClick?.(job)} />
          ))
        )}
      </div>
    </div>
  );
}
