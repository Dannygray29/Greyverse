'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { COUNTRIES } from '@/lib/countries'

const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  'qwertyuiop',
  'letmein123',
  'welcome123',
  'admin123456',
  'football123',
  'efootball123',
  'dreamleague123',
])

function passwordChecks(password: string, email: string, username: string) {
  const normalized = password.toLowerCase()
  return {
    length: password.length >= 12,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
    personal: Boolean(email && (normalized.includes(email.split('@')[0].toLowerCase()) || (username && normalized.includes(username.toLowerCase())))),
    common: COMMON_PASSWORDS.has(normalized),
  }
}

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [country, setCountry] = useState('')
  const [game, setGame] = useState('eFootball')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const checks = useMemo(() => passwordChecks(password, email, username), [password, email, username])
  const passwordValid = checks.length && checks.upper && checks.lower && checks.number && checks.symbol && !checks.personal && !checks.common

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) {
      setMessage('Supabase is not configured.')
      return
    }
    if (!passwordValid) {
      setMessage('Choose a stronger password that meets every requirement below.')
      return
    }

    setBusy(true)
    setMessage('Creating your GreyVerse account…')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, game_name: game, country } },
    })

    if (error) {
      setMessage(error.message)
      setBusy(false)
      return
    }

    if (data.user) {
      const timestamp = new Date().toISOString()
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          user_id: data.user.id,
          username,
          game_name: game,
          country,
          activity_status: 'online',
          privacy_consent_at: timestamp,
          terms_accepted_at: timestamp,
          updated_at: timestamp,
        },
        { onConflict: 'user_id' },
      )

      if (profileError) {
        setMessage(`Account created, but profile setup failed: ${profileError.message}`)
        setBusy(false)
        return
      }

      const { data: existing, error: lookupError } = await supabase
        .from('players')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (lookupError) {
        setMessage(`Profile created, but player lookup failed: ${lookupError.message}`)
        setBusy(false)
        return
      }

      if (!existing) {
        const { error: playerError } = await supabase
          .from('players')
          .insert({ user_id: data.user.id, username, game_type: game, status: 'active' })
        if (playerError) {
          setMessage(`Profile created, but player setup failed: ${playerError.message}`)
          setBusy(false)
          return
        }
      }
    }

    setBusy(false)
    if (data.session) {
      router.replace('/profile')
      router.refresh()
    } else {
      setMessage('Account created. Check your email, then sign in to enter GreyVerse.')
    }
  }

  return (
    <main className="shell">
      <a href="/">← GreyVerse</a>
      <section className="hero">
        <p className="muted">⚡ JOIN THE COMPETITION</p>
        <h1>Create your GreyVerse account</h1>
        <p className="muted">Choose your game profile and country. GreyVerse assigns your starting system automatically.</p>
        <form onSubmit={submit} className="card form">
          <label>Username<input aria-label="Username" placeholder="Username" value={username} onChange={event => setUsername(event.target.value)} required minLength={3} autoComplete="username" /></label>
          <label>Game profile<select aria-label="Game" value={game} onChange={event => setGame(event.target.value)}><option value="eFootball">eFootball</option><option value="DLS">DLS</option></select></label>
          <label>Country<select aria-label="Country" value={country} onChange={event => setCountry(event.target.value)} required><option value="" disabled>Select your country</option>{COUNTRIES.map(name => <option key={name} value={name}>{name}</option>)}</select></label>
          <label>Email<input aria-label="Email" type="email" placeholder="Email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" /></label>
          <label>Password<input aria-label="Password" type="password" placeholder="Password (12+ characters)" minLength={12} value={password} onChange={event => setPassword(event.target.value)} required autoComplete="new-password" /></label>
          <div className="password-guidance" aria-live="polite">
            <p className="muted">Password requirements:</p>
            <p className={checks.length ? 'requirement ok' : 'requirement'}>{checks.length ? '✓' : '○'} At least 12 characters</p>
            <p className={checks.upper ? 'requirement ok' : 'requirement'}>{checks.upper ? '✓' : '○'} One uppercase letter</p>
            <p className={checks.lower ? 'requirement ok' : 'requirement'}>{checks.lower ? '✓' : '○'} One lowercase letter</p>
            <p className={checks.number ? 'requirement ok' : 'requirement'}>{checks.number ? '✓' : '○'} One number</p>
            <p className={checks.symbol ? 'requirement ok' : 'requirement'}>{checks.symbol ? '✓' : '○'} One symbol</p>
            <p className={!checks.personal ? 'requirement ok' : 'requirement'}>{!checks.personal ? '✓' : '○'} Does not contain your username or email name</p>
            <p className={!checks.common ? 'requirement ok' : 'requirement'}>{!checks.common ? '✓' : '○'} Is not a common GreyVerse password</p>
            <p className="muted small">This free-plan check improves password strength but does not replace Supabase’s Pro-only leaked-password database check.</p>
          </div>
          <button className="button" disabled={busy || !passwordValid}>{busy ? 'Creating…' : 'Create account'}</button>
          <p className="muted">{message}</p>
        </form>
      </section>
    </main>
  )
}
