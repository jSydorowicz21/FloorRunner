'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Clock, User, Cpu, CheckCircle2, Play, Plus, MessageSquare, Image
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Job, JobNote, JobOperation, JobStatus } from '@/types'

export default function JobDetailPage() {
  const params = useParams()
  const supabase = createClient()
  const [job, setJob] = useState<Job | null>(null)
  const [notes, setNotes] = useState<JobNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchJob = useCallback(async () => {
    const id = params.id as string
    const [jobResult, notesResult] = await Promise.all([
      supabase
        .from('jobs')
        .select('*, customer:customers(*), operations:job_operations(*, machine:machines(*), operator:users(*))')
        .eq('id', id)
        .single(),
      supabase
        .from('job_notes')
        .select('*, user:users(name, avatar_url)')
        .eq('job_id', id)
        .order('created_at', { ascending: false }),
    ])

    if (jobResult.data) setJob(jobResult.data)
    if (notesResult.data) setNotes(notesResult.data)
    setLoading(false)
  }, [params.id, supabase])

  useEffect(() => {
    fetchJob()
  }, [fetchJob])

  const handleAddNote = async () => {
    if (!newNote.trim() || !job) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('job_notes')
      .insert({ job_id: job.id, user_id: user.id, content: newNote, note_type: 'general' })
      .select('*, user:users(name, avatar_url)')
      .single()

    if (data) {
      setNotes(prev => [data, ...prev])
      setNewNote('')
    }
  }

  const handleStatusChange = async (newStatus: JobStatus) => {
    if (!job) return
    await supabase.from('jobs').update({ status: newStatus }).eq('id', job.id)
    setJob(prev => prev ? { ...prev, status: newStatus } : null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Job not found.</p>
        <Link href="/board" className="text-sm text-primary hover:underline mt-2 inline-block">Back to board</Link>
      </div>
    )
  }

  const statusBadge: Record<JobStatus, string> = {
    quoting: 'bg-yellow-500/10 text-yellow-400',
    scheduled: 'bg-blue-500/10 text-blue-400',
    in_progress: 'bg-orange-500/10 text-orange-400',
    complete: 'bg-green-500/10 text-green-400',
    cancelled: 'bg-gray-500/10 text-gray-400',
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/board" className="text-muted-foreground hover:text-foreground mt-1">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono text-muted-foreground">{job.job_number}</p>
              <h1 className="text-xl font-semibold text-foreground mt-0.5">{job.part_description}</h1>
              {job.customer && (
                <p className="text-sm text-muted-foreground mt-0.5">{job.customer.name}</p>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusBadge[job.status]}`}>
              {job.status.replace('_', ' ')}
            </span>
          </div>

          {/* Quick status change */}
          <div className="flex gap-2 mt-3">
            {(['quoting', 'scheduled', 'in_progress', 'complete'] as JobStatus[]).map(s => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`text-xs px-2 py-1 rounded-md border capitalize transition-colors ${
                  job.status === s
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-surface border border-border rounded-xl p-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Quantity</p>
          <p className="text-sm font-medium text-foreground">{job.quantity}</p>
        </div>
        {job.due_date && (
          <div>
            <p className="text-xs text-muted-foreground">Due Date</p>
            <p className="text-sm font-medium text-foreground">
              {new Date(job.due_date).toLocaleDateString()}
            </p>
          </div>
        )}
        {job.quoted_price && (
          <div>
            <p className="text-xs text-muted-foreground">Quoted</p>
            <p className="text-sm font-medium text-foreground">${job.quoted_price.toFixed(2)}</p>
          </div>
        )}
        {job.part_number && (
          <div>
            <p className="text-xs text-muted-foreground">Part #</p>
            <p className="text-sm font-medium text-foreground font-mono">{job.part_number}</p>
          </div>
        )}
      </div>

      {/* Operations */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Operations</h2>
        </div>

        {job.operations && job.operations.length > 0 ? (
          <div className="space-y-3">
            {job.operations.map(op => (
              <div key={op.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{op.description}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {op.machine && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Cpu size={10} /> {op.machine.name}
                      </span>
                    )}
                    {op.operator && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User size={10} /> {op.operator.name}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                  op.status === 'complete' ? 'bg-green-500/10 text-green-400' :
                  op.status === 'in_progress' ? 'bg-orange-500/10 text-orange-400' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {op.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No operations yet.</p>
        )}
      </div>

      {/* Notes */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MessageSquare size={14} />
          Notes
        </h2>

        <div className="space-y-3">
          {notes.map(note => (
            <div key={note.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs text-primary font-semibold">
                {note.user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-foreground">{note.user?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm text-foreground mt-0.5">{note.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <textarea
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder="Add a note…"
            rows={2}
            className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <button
            onClick={handleAddNote}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 self-end"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
