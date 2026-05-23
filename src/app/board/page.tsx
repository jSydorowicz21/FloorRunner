'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { StatusColumn } from '@/components/board/StatusColumn'
import { CreateJobModal } from '@/components/board/CreateJobModal'
import type { Job, JobStatus } from '@/types'

const STATUSES: JobStatus[] = ['quoting', 'scheduled', 'in_progress', 'complete']

export default function BoardPage() {
  const supabase = createClient()
  const [jobs, setJobs] = useState<Job[]>([])
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const fetchJobs = useCallback(async () => {
    const { data } = await supabase
      .from('jobs')
      .select('*, customer:customers(*)')
      .order('sort_order')
    if (data) setJobs(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchJobs()

    const channel = supabase
      .channel('board-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        fetchJobs()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchJobs, supabase])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const jobId = active.id as string
    const newStatus = over.id as JobStatus

    const job = jobs.find(j => j.id === jobId)
    if (!job || job.status === newStatus) return

    setJobs(prev =>
      prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j)
    )

    await supabase
      .from('jobs')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', jobId)
  }

  const filteredJobs = search
    ? jobs.filter(j =>
        j.part_description.toLowerCase().includes(search.toLowerCase()) ||
        j.job_number.toLowerCase().includes(search.toLowerCase()) ||
        j.customer?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : jobs

  const activeJob = activeId ? jobs.find(j => j.id === activeId) : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Job Board</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90"
        >
          <Plus size={16} />
          New Job
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search jobs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Board */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUSES.map(status => (
            <StatusColumn
              key={status}
              status={status}
              jobs={filteredJobs.filter(j => j.status === status)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeJob && (
            <div className="bg-surface border border-border rounded-lg p-3 shadow-xl opacity-90">
              <p className="text-sm font-medium text-foreground">{activeJob.job_number}</p>
              <p className="text-xs text-muted-foreground">{activeJob.part_description}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {showCreate && <CreateJobModal onClose={() => setShowCreate(false)} onCreated={fetchJobs} />}
    </div>
  )
}
