import {useState} from 'react'
import {useRouter} from 'next/router'
import {signIn} from 'next-auth/react'
import Link from 'next/link'
import styles from '../styles/Signup.module.css'
import Icons from '../components/Icons'

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignup(e) {
    e.preventDefault()
    const form     = e.currentTarget
    const email    = (form.email    && form.email.value    || '').trim()
    const password = (form.password && form.password.value || '').trim()
    const username = (form.username && form.username.value || '').trim()
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setError('')
    setLoading(true)
    // 1. Create account in DB
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: username || email.split('@')[0] }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setLoading(false)
      setError(data.error || 'Registration failed')
      return
    }
    // 2. Sign in immediately after account creation
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })
    setLoading(false)
    if (result?.error) {
      setError('Account created — please log in')
      router.push('/login')
    } else {
      router.push('/dashboard')
    }
  }
  return (
    <div className={styles.page}>
      <div className={styles.signupHero}>
        <svg width="84" height="84" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.bolt} aria-hidden>
          <defs>
            <linearGradient id="g2" x1="0" x2="1">
              <stop offset="0%" stopColor="#ff3cac" />
              <stop offset="100%" stopColor="#784ba0" />
            </linearGradient>
          </defs>
          <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" fill="url(#g2)" />
        </svg>

        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Start your learning adventure today</p>

        <form className={styles.formCard} onSubmit={handleSignup}>
          <label className={styles.label}>
            Username
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><Icons.User size={18} /></span>
              <input name="username" className={styles.input} placeholder="olcoder" />
            </div>
          </label>

          <label className={styles.label}>
            Email
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><Icons.Mail size={18} /></span>
              <input type="email" name="email" autoComplete="email" className={styles.input} placeholder="you@example.com" />
            </div>
          </label>

          <label className={styles.label}>
            Password
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><Icons.Lock size={18} /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                className={styles.input}
                placeholder="••••••"
              />
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <Icons.Eye size={16} /> : <Icons.Eye size={16} />}
              </button>
            </div>
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.signBtn} disabled={loading}>{loading ? 'Creating account…' : 'Sign Up'}</button>

          <p className={styles.small}>Already have an account? <Link href="/login" className={styles.link}>Login</Link></p>
        </form>
      </div>
    </div>
  )
}
