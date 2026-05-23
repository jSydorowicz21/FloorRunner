'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

// ── Jobs ────────────────────────────────────────────────────

export async function createJob(formData: {
  customer_id: string
  part_description: string
  part_number?: string
  quantity: number
  due_date: string
  quoted_price?: number
  priority?: 'normal' | 'rush'
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Get user's shop
  const { data: userRecord } = await supabase
    .from('users')
    .select('shop_id')
    .eq('id', user.id)
    .single()

  if (!userRecord) return { error: 'User not found' }

  // Generate job number
  const { data: jobData, error: genError } = await supabase
    .rpc('generate_job_number', { shop_id: userRecord.shop_id })

  if (genError) return { error: genError.message }

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      shop_id: userRecord.shop_id,
      customer_id: formData.customer_id,
      job_number: jobData,
      part_description: formData.part_description,
      part_number: formData.part_number ?? null,
      quantity: formData.quantity,
      due_date: formData.due_date,
      quoted_price: formData.quoted_price ?? null,
      priority: formData.priority ?? 'normal',
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function updateJob(jobId: string, updates: Record<string, unknown>) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function updateJobStatus(jobId: string, status: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const updates: Record<string, unknown> = { status }
  if (status === 'complete') {
    updates.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function deleteJob(jobId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('jobs').delete().eq('id', jobId)
  if (error) return { error: error.message }
  return { success: true }
}

// ── Operations ─────────────────────────────────────────────

export async function createOperation(formData: {
  job_id: string
  operation_number: number
  description: string
  machine_id?: string
  operator_id?: string
  est_minutes?: number
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('job_operations')
    .insert({
      job_id: formData.job_id,
      operation_number: formData.operation_number,
      description: formData.description,
      machine_id: formData.machine_id ?? null,
      operator_id: formData.operator_id ?? null,
      est_minutes: formData.est_minutes ?? null,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function updateOperation(operationId: string, updates: Record<string, unknown>) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('job_operations')
    .update(updates)
    .eq('id', operationId)
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function completeOperation(operationId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('job_operations')
    .update({
      status: 'complete',
      completed_at: new Date().toISOString(),
    })
    .eq('id', operationId)
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

// ── Notes ──────────────────────────────────────────────────

export async function createNote(formData: { job_id: string; content: string; note_type?: string }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('job_notes')
    .insert({
      job_id: formData.job_id,
      user_id: user.id,
      content: formData.content,
      note_type: formData.note_type ?? 'general',
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

// ── Team ───────────────────────────────────────────────────

export async function inviteOperator(email: string, name: string) {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Get user's shop
  const { data: userRecord } = await supabase
    .from('users')
    .select('shop_id')
    .eq('id', user.id)
    .single()

  if (!userRecord) return { error: 'User not found' }

  // Invite via admin client (bypasses RLS)
  const { error } = await adminClient.auth.admin.generateLink({
    type: 'invite',
    email,
  })

  if (error) return { error: error.message }

  return { success: true }
}

export async function updateOperator(operatorId: string, updates: { name?: string; role?: string; is_active?: boolean }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', operatorId)
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

// ── Portal ─────────────────────────────────────────────────

export async function generatePortalCode(customerId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const code = Math.random().toString(36).substring(2, 10).toUpperCase()
  const codeHash = btoa(code)

  const { data, error } = await supabase
    .from('portal_codes')
    .insert({
      customer_id: customerId,
      code_hash: codeHash,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data: { ...data, code } }
}
