import {useState} from 'react'
import {useRouter} from 'next/router'
import Link from 'next/link'
import styles from '../styles/Signup.module.css'
import Icons from '../components/Icons'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  function handleLogin(e){
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.email && form.email.value || '').trim()
    const password = (form.password && form.password.value || '').trim()
    if(!email || !password){
      setError('Please enter email and password')
      return
    }
    setError('')
    try{ localStorage.setItem('brainbyte_user', JSON.stringify({ username: email.split('@')[0], email })) }catch(e){}
    try{ window.dispatchEvent(new Event('brainbyte_auth_changed')) }catch(e){}
    router.push('/dashboard')
  }
  return (
    <div className={styles.page}>
      <div className={styles.signupHero}>
        <svg width="84" height="84" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.bolt} aria-hidden>
          <defs>
            <linearGradient id="g3" x1="0" x2="1">
              <stop offset="0%" stopColor="#ff3cac" />
              <stop offset="100%" stopColor="#784ba0" />
            </linearGradient>
          </defs>
          <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" fill="url(#g3)" />
        </svg>

        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Continue your learning journey</p>

        <form className={styles.formCard} onSubmit={handleLogin}>
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
                autoComplete="current-password"
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

          <button type="submit" className={styles.signBtn}>Login</button>

          <p className={styles.small}>Don't have an account? <Link href="/signup" className={styles.link}>Sign up</Link></p>
        </form>
      </div>
    </div>
  )
}
