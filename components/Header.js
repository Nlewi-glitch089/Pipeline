import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../styles/Home.module.css'
import Icons from './Icons'
import { useSession, signOut } from 'next-auth/react'

export default function Header({ hideAuth = false }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const user = session?.user
    ? { username: session.user.name || session.user.email?.split('@')[0] }
    : null

  function handleLogout() {
    signOut({ callbackUrl: '/login' })
  }

  const isHome     = router && router.pathname === '/'
  const hydrated   = status !== 'loading'
  const showSignOut = !!user && router && (router.pathname === '/dashboard' || router.pathname.startsWith('/dashboard'))

  return (
    <header className={styles.header}>
      <div className={styles.brand}><Link href="/"><span className={styles.brandText}>BrainByte</span></Link></div>

      <div style={{display:'flex',alignItems:'center',gap:18}}>
        { !hydrated ? null : user ? (
          <>
            <nav className={styles.nav}>
              <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
              <Link href="/courses" className={styles.navLink}>Courses</Link>
            </nav>
            <div className={styles.userArea}>
              <button className={styles.userBtn} title="Notifications"><Icons.Bell size={16} /></button>
              <div className={styles.userBtn}><span style={{marginRight:8}}><Icons.User size={16} /></span><span className={styles.userName}>{user.username}</span></div>
              {showSignOut && <button onClick={handleLogout} className={styles.signupBtn} style={{marginLeft:10}}>Sign out</button>}
            </div>
          </>
        ) : (
          !isHome && !hideAuth && (
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <Link href="/login" className={styles.navLink}>Login</Link>
              <Link href="/signup" className={styles.signupBtn}>Sign Up</Link>
            </div>
          )
        )}
      </div>
    </header>
  )
}
