'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [mode, setMode] = useState<'password' | 'magic'>('password')

  const supabase = createClient()

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      window.location.href = '/board'
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      setError(error.message)
    } else {
      setMagicLinkSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="text-4xl">🏭</div>
          <h1 className="text-2xl font-semibold text-foreground">Floor Runner</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
          {magicLinkSent ? (
            <div className="text-center space-y-3">
              <div className="text-2xl">✉️</div>
              <p className="text-sm text-muted-foreground">
                Check your email for a magic link to sign in.
              </p>
              <button
                onClick={() => setMagicLinkSent(false)}
                className="text-sm text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setMode('password')}
                  className={`flex-1 py-2 text-sm rounded-md border ${
                    mode === 'password'
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => setMode('magic')}
                  className={`flex-1 py-2 text-sm rounded-md border ${
                    mode === 'magic'
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  Magic Link
                </button>
              </div>

              <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="you@shop.com"
                    required
                  />
                </div>

                {mode === 'password' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1" htmlFor="password">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                )}

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Signing in…' : mode === 'password' ? 'Sign In' : 'Send Magic Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <a href="/auth/signup" className="text-primary hover:underline">
            Create an account
          </a>
        </p>
      </div>
    </div>
  )
}
