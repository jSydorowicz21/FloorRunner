import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  let query = supabase
    .from('jobs')
    .select('*, customer:customers(*), operations:job_operations(*)')
    .order('sort_order')

  if (status) query = query.eq('status', status)
  if (search) query = query.ilike('part_description', `%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Get shop
  const { data: userRecord } = await supabase
    .from('users').select('shop_id').eq('id', user.id).single()
  if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Generate job number
  const { data: jobNumber } = await supabase.rpc('generate_job_number', { shop_id: userRecord.shop_id })

  const { data, error } = await supabase
    .from('jobs')
    .insert({ ...body, shop_id: userRecord.shop_id, job_number: jobNumber })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
