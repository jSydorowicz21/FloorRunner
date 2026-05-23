// ============================================================
// Floor Runner — Shared TypeScript Types
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ── Enums (must match supabase/migrations/001_initial_schema.sql) ────────────

export type JobStatus = 'quoting' | 'scheduled' | 'in_progress' | 'complete' | 'cancelled'
export type JobPriority = 'normal' | 'rush'
export type MachineStatus = 'running' | 'idle' | 'down' | 'maintenance'
export type OperationStatus = 'pending' | 'in_progress' | 'complete'
export type TimeEntryType = 'timer' | 'manual' | 'system'
export type NoteType = 'general' | 'issue' | 'update' | 'internal' | 'customer'
export type PhotoType = 'setup' | 'part' | 'qc' | 'other'
export type UserRole = 'owner' | 'operator'
export type PlanType = 'free' | 'starter' | 'pro' | 'shop'

// ── Database Tables ─────────────────────────────────────────

export interface Shop {
  id: string
  name: string
  slug: string
  owner_id: string
  plan: PlanType
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  shop_id: string
  name: string
  email: string
  phone: string | null
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  last_active_at: string | null
  created_at: string
}

export interface Machine {
  id: string
  shop_id: string
  name: string
  machine_type: string
  status: MachineStatus
  status_note: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  shop_id: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  shop_id: string
  customer_id: string
  job_number: string
  part_number: string | null
  part_description: string
  quantity: number
  due_date: string
  quoted_price: number | null
  status: JobStatus
  priority: JobPriority
  current_operation_id: string | null
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
  completed_at: string | null
  // Joined
  customer?: Customer
  operations?: JobOperation[]
}

export interface JobOperation {
  id: string
  job_id: string
  operation_number: number
  description: string
  machine_id: string | null
  operator_id: string | null
  status: OperationStatus
  started_at: string | null
  completed_at: string | null
  est_minutes: number | null
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
  // Joined
  machine?: Machine
  operator?: User
  job?: Pick<Job, 'id' | 'job_number' | 'part_description'>
}

export interface OperationTimeEntry {
  id: string
  operation_id: string
  operator_id: string
  started_at: string
  ended_at: string | null
  duration_minutes: number | null
  entry_type: TimeEntryType
  notes: string | null
  created_at: string
}

export interface JobNote {
  id: string
  job_id: string
  user_id: string
  content: string
  note_type: NoteType
  created_at: string
  // Joined
  user?: Pick<User, 'name' | 'avatar_url'>
}

export interface JobPhoto {
  id: string
  job_id: string
  operation_id: string | null
  user_id: string
  url: string
  filename: string | null
  caption: string | null
  photo_type: PhotoType
  created_at: string
}

export interface ShopSetting {
  id: string
  shop_id: string
  key: string
  value: string | null
  updated_at: string
}

export interface PortalCode {
  id: string
  shop_id: string
  customer_id: string
  code_hash: string
  created_at: string
  // Joined
  customer?: Customer
}

// ── API Response Shapes ─────────────────────────────────────

export interface ApiError {
  error: string
}

export interface StatsResponse {
  total_jobs: number
  active_jobs: number
  completed_jobs: number
  total_revenue: number
  machines_on_floor: number
  operators_active: number
}
