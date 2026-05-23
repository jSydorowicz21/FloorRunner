'use client'

import { useState, useEffect } from 'react'
import { Plus, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types'

export default function TeamPage() {
  const supabase = createClient()
  const [operators, setOperators] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('users').select('*').order('name').then(({ data }) => {
      if (data) setOperators(data)
      setLoading(false)
    })
  }, [supabase])

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
        <h1 className="text-xl font-semibold text-foreground">Team</h1>
        <button
          onClick={() => {/* TODO: invite modal */}}
          className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90"
        >
          <Plus size={16} />
          Invite Operator
        </button>
      </div>

      {operators.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">👷</div>
          <p className="text-sm">No team members yet. Invite your first operator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {operators.map(op => (
            <div key={op.id} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                  {op.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{op.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{op.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                  op.role === 'owner' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {op.role}
                </span>
              </div>
              {op.is_active ? (
                <div className="mt-3 flex items-center gap-1 text-xs text-green-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Active
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  Inactive
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
