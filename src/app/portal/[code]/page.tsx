'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Link2, Copy, CheckCircle } from 'lucide-react'
import type { Job, Customer } from '@/types'

export default function PortalPage() {
  const params = useParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = params.code as string
    fetch(`/api/portal/${code}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setJobs(data || [])
          if (data[0]?.customer) setCustomer(data[0].customer)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load portal')
        setLoading(false)
      })
  }, [params.code])

  const portalUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(portalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Invalid Portal Link</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {customer?.name || 'Job Portal'}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Track your job progress</p>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm text-muted-foreground hover:text-foreground"
            >
              {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Jobs */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <p className="text-sm text-muted-foreground">{jobs.length} job{jobs.length !== 1 ? 's' : ''} found</p>

        {jobs.map(job => (
          <div key={job.id} className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground">{job.job_number}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{job.part_description}</p>
                {job.part_number && (
                  <p className="text-xs text-muted-foreground">Part #: {job.part_number}</p>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                job.status === 'complete' ? 'bg-green-500/10 text-green-400' :
                job.status === 'in_progress' ? 'bg-orange-500/10 text-orange-400' :
                job.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400' :
                'bg-yellow-500/10 text-yellow-400'
              }`}>
                {job.status.replace('_', ' ')}
              </span>
            </div>

            {job.due_date && (
              <p className="text-xs text-muted-foreground mt-2">
                Due: {new Date(job.due_date).toLocaleDateString()}
              </p>
            )}

            {job.operations && job.operations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Operations</p>
                <div className="space-y-1">
                  {job.operations.map(op => (
                    <div key={op.id} className="flex items-center justify-between text-xs">
                      <span className="text-foreground">{op.description}</span>
                      <span className={`capitalize ${
                        op.status === 'complete' ? 'text-green-400' :
                        op.status === 'in_progress' ? 'text-orange-400' :
                        'text-muted-foreground'
                      }`}>
                        {op.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
