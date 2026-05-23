import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET: fetch jobs visible through a portal code (no auth required)
export async function GET(request: Request, { params }: { params: { code: string } }) {
  const supabase = await createClient()

  const codeHash = btoa(params.code)

  const { data: portalCode } = await supabase
    .from('portal_codes')
    .select('customer_id, shop_id')
    .eq('code_hash', codeHash)
    .single()

  if (!portalCode) {
    return NextResponse.json({ error: 'Invalid portal code' }, { status: 404 })
  }

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*, operations:job_operations(*), customer:customers(*)')
    .eq('customer_id', portalCode.customer_id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(jobs)
}
