import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST: generate a portal code for a customer
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { customer_id } = body

  const code = Math.random().toString(36).substring(2, 10).toUpperCase()
  const codeHash = btoa(code)

  const { data, error } = await supabase
    .from('portal_codes')
    .insert({ customer_id, code_hash: codeHash })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/${code}`
  return NextResponse.json({ ...data, portal_url: portalUrl, code })
}
