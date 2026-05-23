'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Machine } from '@/types'

export default function MachinesPage() {
  const supabase = createClient()
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('machines').select('*').order('sort_order').then(({ data }) => {
      if (data) setMachines(data)
      setLoading(false)
    })
  }, [supabase])

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Machines</h1>
        <a
          href="/machines/new"
          className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90"
        >
          <Plus size={16} />
          Add Machine
        </a>
      </div>

      {machines.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">🔧</div>
          <p className="text-sm">No machines yet. Add your first machine to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map(machine => (
            <div key={machine.id} className="bg-surface border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{machine.name}</h3>
                  <p className="text-sm text-muted-foreground">{machine.machine_type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${statusColors[machine.status] || 'bg-gray-500'}`} />
                  <span className="text-xs text-muted-foreground capitalize">{machine.status.replace('_', ' ')}</span>
                </div>
              </div>
              {machine.status_note && (
                <p className="text-xs text-muted-foreground mt-2">{machine.status_note}</p>
              )}
              <div className="mt-3 pt-3 border-t border-border flex gap-2">
                <a
                  href={`/machines/${machine.id}`}
                  className="text-xs text-primary hover:underline"
                >
                  View details
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
