'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Shop, User } from '@/types'

export default function SettingsPage() {
  const supabase = createClient()
  const [shop, setShop] = useState<Shop | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [shopName, setShopName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load current user and their shop
    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (!authUser) return
      const { data: userRecord } = await supabase
        .from('users').select('*').eq('id', authUser.id).single()
      if (userRecord) {
        setUser(userRecord)
        const { data: shopRecord } = await supabase
          .from('shops').select('*').eq('id', userRecord.shop_id).single()
        if (shopRecord) {
          setShop(shopRecord)
          setShopName(shopRecord.name)
        }
      }
    })
  }, [supabase])

  const handleSave = async () => {
    if (!shop) return
    setSaving(true)
    await supabase.from('shops').update({ name: shopName }).eq('id', shop.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const planLabels: Record<string, string> = {
    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
    shop: 'Shop',
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-foreground">Settings</h1>

      {/* Shop Info */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Shop</h2>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Shop Name</label>
          <input
            type="text"
            value={shopName}
            onChange={e => setShopName(e.target.value)}
            className="w-full max-w-md px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {shop && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Shop Slug</label>
            <p className="text-sm text-muted-foreground font-mono">{shop.slug}</p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Plan */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Plan</h2>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              {shop ? planLabels[shop.plan] || shop.plan : '…'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {shop?.plan === 'free'
              ? 'You\'re on the free plan. Upgrade to unlock more features.'
              : 'Your current plan.'}
          </p>
        </div>

        {shop?.plan === 'free' && (
          <a
            href="#"
            className="inline-block px-4 py-2 border border-primary text-primary rounded-md text-sm font-medium hover:bg-primary/10"
          >
            Upgrade Plan
          </a>
        )}
      </div>

      {/* Account */}
      {user && (
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Account</h2>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      )}
    </div>
  )
}
