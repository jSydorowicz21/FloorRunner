import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userRecord } = await supabase
    .from('users').select('shop_id').eq('id', user.id).single()

  if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const [jobsResult, machinesResult, operatorsResult] = await Promise.all([
    supabase.from('jobs').select('status', { count: 'exact' }).eq('shop_id', userRecord.shop_id),
    supabase.from('machines').select('id, status').eq('shop_id', userRecord.shop_id),
    supabase.from('users').select('id, last_active_at').eq('shop_id', userRecord.shop_id),
  ])

  const jobs = jobsResult.data || []
  const machines = machinesResult.data || []
  const operators = operatorsResult.data || []

  const total_jobs = jobs.length
  const active_jobs = jobs.filter(j => j.status === 'in_progress' || j.status === 'scheduled').length
  const completed_jobs = jobs.filter(j => j.status === 'complete').length
  const machines_on_floor = machines.filter(m => m.status === 'running' || m.status === 'idle').length
  const operators_active = operators.filter(o => o.last_active_at &&
    new Date(o.last_active_at).getTime() > Date.now() - 3600 * 1000).length

  return NextResponse.json({
    total_jobs,
    active_jobs,
    completed_jobs,
    machines_on_floor,
    operators_active,
    total_revenue: 0,
  })
}
