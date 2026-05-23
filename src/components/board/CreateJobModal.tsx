'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Customer } from '@/types'

interface CreateJobModalProps {
  onClose: () => void
  onCreated: () => void
}

export function CreateJobModal({ onClose, onCreated }: CreateJobModalProps) {
  const supabase = createClient()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    customer_id: '',
    part_description: '',
    part_number: '',
    quantity: 1,
    due_date: '',
    quoted_price: '',
    priority: 'normal' as 'normal' | 'rush',
  })

  useEffect(() => {
    supabase.from('customers').select('*').order('name').then(({ data }) => {
      if (data) setCustomers(data)
    })
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.rpc('generate_job_number', {
      shop_id: (await supabase.from('users').select('shop_id').single()).data?.shop_id,
    }).then(async ({ data: jobNumber }) => {
      return supabase.from('jobs').insert({
        customer_id: form.customer_id,
        part_description: form.part_description,
        part_number: form.part_number || null,
        quantity: form.quantity,
        due_date: form.due_date,
        quoted_price: form.quoted_price ? Number(form.quoted_price) : null,
        priority: form.priority,
        job_number: jobNumber,
      })
    })

    setLoading(false)
    if (!error) {
      onCreated()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg mx-4 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">New Job</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Customer</label>
            <select
              value={form.customer_id}
              onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select customer…</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Part Description</label>
            <input
              type="text"
              value={form.part_description}
              onChange={e => setForm(f => ({ ...f, part_description: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="CNC milling of aluminum bracket"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Part Number</label>
              <input
                type="text"
                value={form.part_number}
                onChange={e => setForm(f => ({ ...f, part_number: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="PN-1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Quoted Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.quoted_price}
                onChange={e => setForm(f => ({ ...f, quoted_price: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={form.priority === 'rush'}
                onChange={e => setForm(f => ({ ...f, priority: e.target.checked ? 'rush' : 'normal' }))}
                className="rounded border-border text-primary focus:ring-primary"
              />
              Rush priority
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-border rounded-md text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
