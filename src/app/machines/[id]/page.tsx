'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Clock, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Machine, JobOperation } from '@/types'

export default function MachineDetailPage() {
  const params = useParams()
  const supabase = createClient()
  const [machine, setMachine] = useState<Machine | null>(null)
  const [operations, setOperations] = useState<JobOperation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params.id as string
    Promise.all([
      supabase.from('machines').select('*').eq('id', id).single(),
      supabase.from('job_operations').select('*, job:jobs(job_number, part_description)').eq('machine_id', id).order('started_at', { ascending: false }).limit(20),
    ]).then(([{ data: machineData }, { data: opsData }]) => {
      if (machineData) setMachine(machineData)
      if (opsData) setOperations(opsData)
      setLoading(false)
    })
  }, [params.id, supabase])

  const statusColors: Record<string, string> = {
    running: 'bg-green-500',
    idle: 'bg-blue-500',
    down: 'bg-red-500',
    maintenance: 'bg-yellow-500',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!machine) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Machine not found.</p>
        <a href="/machines" className="text-sm text-primary hover:underline mt-2 inline-block">Back to machines</a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <a href="/machines" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </a>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-foreground">{machine.name}</h1>
          <div className={`w-3 h-3 rounded-full ${statusColors[machine.status] || 'bg-gray-500'}`} />
          <span className="text-sm text-muted-foreground capitalize">{machine.status.replace('_', ' ')}</span>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Machine Type</p>
            <p className="text-sm text-foreground">{machine.machine_type}</p>
          </div>
          {machine.status_note && (
            <div>
              <p className="text-xs text-muted-foreground">Status Note</p>
              <p className="text-sm text-foreground">{machine.status_note}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Recent Operations</h2>
        {operations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No operations yet.</p>
        ) : (
          <div className="space-y-3">
            {operations.map(op => (
              <div key={op.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{op.description}</p>
                  {op.job && (
                    <p className="text-xs text-muted-foreground font-mono">{op.job.job_number}</p>
                  )}
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
        )}
      </div>
    </div>
  )
}
