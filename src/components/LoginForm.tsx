'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()

  // Check for auth error from callback
  const authError = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || 'Check your email for the login link!')
        setEmail('')
      } else {
        setError(data.error || 'Failed to send magic link')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {authError === 'auth_failed' && (
        <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
          Authentication failed. Please try again.
        </p>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
          placeholder="you@example.com"
          required
          autoFocus
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {success && (
        <p className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Sending...' : 'Send Magic Link'}
      </button>

      <p className="text-sm text-gray-500 text-center">
        We&apos;ll send you a magic link to sign in instantly.
      </p>
    </form>
  )
}
