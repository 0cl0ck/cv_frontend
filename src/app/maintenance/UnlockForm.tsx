'use client'

import { useState } from 'react'

export default function UnlockForm() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const unlock = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch('/api/maintenance/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        setError('Mot de passe invalide')
        return
      }
      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 600)
    } catch {
      setError("Erreur réseau")
    } finally {
      setLoading(false)
    }
  }

  const lock = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      await fetch('/api/maintenance/lock', { method: 'POST' })
      window.location.href = '/maintenance'
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: '1.25rem', display: 'inline-block', width: '100%', maxWidth: 420 }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          style={{ flex: 1, padding: '0.625rem 0.75rem', borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0' }}
          name="maintenance-password"
          autoComplete="off"
        />
        <button
          onClick={unlock}
          disabled={loading || password.length === 0}
          style={{ padding: '0.625rem 0.875rem', borderRadius: 8, background: '#22c55e', color: '#0b0f1a', fontWeight: 600, border: 'none', cursor: 'pointer', opacity: loading ? 0.8 : 1 }}
        >
          {loading ? '...' : 'Déverrouiller'}
        </button>
      </div>
      {error ? (
        <div style={{ color: '#fca5a5', fontSize: 14 }}>{error}</div>
      ) : success ? (
        <div style={{ color: '#86efac', fontSize: 14 }}>Accès autorisé</div>
      ) : null}
      <div style={{ marginTop: '0.75rem' }}>
        <button
          onClick={lock}
          style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: 'transparent', color: '#93c5fd', border: '1px solid #1e293b', cursor: 'pointer' }}
        >
          Fermer l&apos;accès
        </button>
      </div>
    </div>
  )
}
