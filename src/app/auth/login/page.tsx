'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { signIn } from '@/services/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorText, setErrorText] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (loading) return

    setLoading(true)
    setErrorText('')

    const cleanEmail = email.trim()

    const { error } = await signIn(cleanEmail, password)

    if (error) {
      setErrorText(error.message)
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-md rounded-2xl border p-6">
        <h1 className="text-2xl font-bold">Sign in</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          <div>
            <label className="text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border px-4 py-3 font-medium"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          {errorText && (
            <p className="text-sm text-red-600">{errorText}</p>
          )}

        </form>

        <p className="mt-6 text-sm">
          Do not have an account?{' '}
          <Link href="/auth/register" className="underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  )
}