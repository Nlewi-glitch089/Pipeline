import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import Icons from './Icons'

export default function Header({ hideAuth = false }){
  const [user, setUser] = useState(null)
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)

  useEffect(()=>{
    try{
      const raw = localStorage.getItem('brainbyte_user')
      if(raw) setUser(JSON.parse(raw))
    }catch(e){/* ignore */}
    setHydrated(true)
  },[])

  useEffect(()=>{
    function onAuthChange(){
      try{
        const raw = localStorage.getItem('brainbyte_user')
        if(raw) setUser(JSON.parse(raw))
        else setUser(null)
      }catch(e){setUser(null)}
      setHydrated(true)
    }
    window.addEventListener('brainbyte_auth_changed', onAuthChange)
    window.addEventListener('storage', onAuthChange)
    return ()=>{ window.removeEventListener('brainbyte_auth_changed', onAuthChange); window.removeEventListener('storage', onAuthChange) }
  },[])

  function handleLogout(){
    localStorage.removeItem('brainbyte_user')
    setUser(null)
    router.push('/login')
  }

  const isHome = router && router.pathname === '/'
  const showSignOut = user && router && (router.pathname === '/dashboard' || router.pathname.startsWith('/dashboard'))

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
