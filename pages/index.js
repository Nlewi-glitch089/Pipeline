import Link from 'next/link'
import styles from '../styles/Home.module.css'
import Header from '../components/Header'
import Icons from '../components/Icons'

export default function Home() {
  // buttons styled via CSS module to achieve neon/glow effects

  return (
    <div className={`${styles.page} ${styles.homePage}`}>
      <Header hideAuth={true} />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroIcon} aria-hidden>
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{position:'relative',zIndex:2}}>
              <defs>
                <linearGradient id="h" x1="0" x2="1">
                  <stop offset="0%" stopColor="#ff2d86" />
                  <stop offset="50%" stopColor="#9b59ff" />
                  <stop offset="100%" stopColor="#3fe0ff" />
                </linearGradient>
              </defs>
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#h)" />
            </svg>
          </div>
          <h1 className={styles.title}><span className={styles.brandText}>BrainByte</span></h1>
          <p className={styles.subtitle}>Learn faster with interactive courses, AI assistance, and a vibrant learning community</p>
          <div className={styles.ctaRow}>
            <Link href="/signup" className={styles['neon-button']}>Get Started Free</Link>
          </div>
        </section>

        <section className={styles.features}>
          <div className={styles.card}>
            <div className={styles.cardIcon}><div className={styles.iconWrap}><Icons.Book size={26} /></div></div>
            <h3>Interactive Courses</h3>
            <p>Learn by doing with hands-on projects and real-world examples</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}><div className={styles.iconWrap}><Icons.Robot size={26} /></div></div>
            <h3>AI-Powered Help</h3>
            <p>Get instant answers to your questions with our intelligent AI assistant</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}><div className={styles.iconWrap}><Icons.Chart size={26} /></div></div>
            <h3>Track Progress</h3>
            <p>Monitor your learning journey with detailed analytics and achievements</p>
          </div>
        </section>

        <section className={styles.stats}>
          <div className={styles.statsPanel}>
            <h2>Join Thousands of Learners</h2>
            <div className={styles.metrics}>
              <div className={styles.metric}>
                <div className={styles.metricBig + ' ' + styles.cyan}>10K+</div>
                <div className={styles.metricLabel}>Active Students</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricBig + ' ' + styles.purple}>50+</div>
                <div className={styles.metricLabel}>Courses</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricBig + ' ' + styles.pink}>95%</div>
                <div className={styles.metricLabel}>Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>© {new Date().getFullYear()} BrainByte — Learn better, faster.</footer>
    </div>
  )
}
