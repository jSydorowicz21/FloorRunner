'use client'

import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Clock, User, AlertCircle } from 'lucide-react'
import type { Job, JobStatus } from '@/types'

interface StatusColumnProps {
  status: JobStatus
  jobs: Job[]
}

const STATUS_LABELS: Record<JobStatus, string> = {
  quoting: 'Quoting',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  complete: 'Complete',
  cancelled: 'Cancelled',
}

const STATUS_STYLES: Record<JobStatus, string> = {
  quoting: 'border-l-yellow-400 bg-yellow-500/5',
  scheduled: 'border-l-blue-400 bg-blue-500/5',
  in_progress: 'border-l-orange-400 bg-orange-500/5',
  complete: 'border-l-green-400 bg-green-500/5',
  cancelled: 'border-l-gray-400 bg-gray-500/5',
}

export function StatusColumn({ status, jobs }: StatusColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === 'quoting' ? 'bg-yellow-400' :
            status === 'scheduled' ? 'bg-blue-400' :
            status === 'in_progress' ? 'bg-orange-400' :
            status === 'complete' ? 'bg-green-400' : 'bg-gray-400'
          }`} />
          <h3 className="text-sm font-semibold text-foreground">{STATUS_LABELS[status]}</h3>
          <span className="text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded-full">
            {jobs.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-[200px] rounded-lg border-2 border-dashed transition-colors ${
          isOver ? 'border-primary bg-primary/5' : 'border-transparent'
        }`}
      >
        {jobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
        {jobs.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
            Drop jobs here
          </div>
        )}
      </div>
    </div>
  )
}

function JobCard({ job }: { job: Job }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const daysUntilDue = job.due_date
    ? Math.ceil((new Date(job.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && job.status !== 'complete'
  const isRush = job.priority === 'rush'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-surface border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-shadow ${
        isDragging ? 'shadow-xl opacity-50' : 'hover:shadow-md'
      } ${isRush ? 'border-l-2 border-l-red-500' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-mono text-muted-foreground">{job.job_number}</p>
        {isRush && <AlertCircle size={12} className="text-red-400 shrink-0" />}
      </div>

      <p className="text-sm font-medium text-foreground mt-1 line-clamp-2">
        {job.part_description}
      </p>

      {job.customer && (
        <p className="text-xs text-muted-foreground mt-1">{job.customer.name}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        {daysUntilDue !== null && (
          <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-muted-foreground'}`}>
            <Clock size={10} />
            <span>
              {isOverdue ? `${Math.abs(daysUntilDue)}d overdue` :
               daysUntilDue === 0 ? 'Due today' :
               `${daysUntilDue}d`}
            </span>
          </div>
        )}
        {job.quantity > 1 && (
          <span className="text-xs text-muted-foreground">×{job.quantity}</span>
        )}
      </div>
    </div>
  )
}
