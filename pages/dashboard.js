import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../styles/Home.module.css'
import Header from '../components/Header'
import Icons from '../components/Icons'

const mockCourses = [
  { id: 1, title: 'Intro to JavaScript', level: 'Beginner', lessons: 12, progress: 65, author: 'Sarah Chen', enrolled: true },
  { id: 2, title: 'Python Basics', level: 'Beginner', lessons: 10, progress: 20, author: 'Marcus Williams', enrolled: true },
  { id: 3, title: 'CSS Layouts', level: 'Intermediate', lessons: 8, progress: 0, author: 'Lena Ortiz', enrolled: false }
]

const mockAchievements = [
  { id: 'a1', title: 'First Steps', description: 'Complete your first lesson', unlocked: true },
  { id: 'a2', title: 'On Fire', description: 'Maintain a 5-day learning streak', unlocked: true },
  { id: 'a3', title: 'Knowledge Seeker', description: 'Complete 10 lessons', unlocked: false }
]

export default function Dashboard() {
  const router = useRouter()

  const user = { username: 'Nakerra', streak: 5, lessonsCompleted: 12, quizAverage: 82 }

  const enrolledCourses = mockCourses.filter(c => c.enrolled)

  const nextLesson = { title: 'JavaScript Arrays', course: 'Intro to JavaScript', time: 30 }

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div style={{ maxWidth: 1200, width: '100%' }}>
          <div className={`${styles['gradient-card']} ${styles.statsPanel}`} style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -60, top: -40, width: 240, height: 240, borderRadius: '50%', background: 'var(--card-glow)', opacity: 0.08, filter: 'blur(36px)' }} />
            <h2>Welcome back, <span>{user.username}</span></h2>
            <p style={{ color: 'var(--muted)' }}>Ready to continue your learning journey?</p>
          </div>

          <div className={styles.statRow}>
            <div className={`${styles['neon-card']} ${styles.statCard}`}>
              <div style={{display:'flex',alignItems:'center'}}>
                <div className={styles.statIcon}><Icons.Fire size={26} /></div>
                <div>
                  <div className={styles.statLabel}>Day Streak</div>
                </div>
              </div>
              <div className={styles.statValue}>{user.streak}</div>
            </div>

            <div className={`${styles['neon-card']} ${styles.statCard}`}>
              <div style={{display:'flex',alignItems:'center'}}>
                <div className={styles.statIcon}><Icons.Book size={26} /></div>
                <div>
                  <div className={styles.statLabel}>Lessons Completed</div>
                </div>
              </div>
              <div className={styles.statValue}>{user.lessonsCompleted}</div>
            </div>

            <div className={`${styles['neon-card']} ${styles.statCard}`}>
              <div style={{display:'flex',alignItems:'center'}}>
                <div className={styles.statIcon}><Icons.Target size={26} /></div>
                <div>
                  <div className={styles.statLabel}>Quiz Average</div>
                </div>
              </div>
              <div className={styles.statValue}>{user.quizAverage}%</div>
            </div>

            <div className={`${styles['neon-card']} ${styles.statCard}`}>
              <div style={{display:'flex',alignItems:'center'}}>
                <div className={styles.statIcon}><Icons.Trophy size={26} /></div>
                <div>
                  <div className={styles.statLabel}>Achievements</div>
                </div>
              </div>
              <div className={styles.statValue}>{mockAchievements.filter(a=>a.unlocked).length}</div>
            </div>
          </div>

          <div className={`${styles['gradient-card']} ${styles.continueBanner}`}>
            <div className={styles.continueLeft}>
              <div className={styles.continueTitle}>Continue Learning</div>
              <div className={styles.continueMeta}>{nextLesson.course} · {nextLesson.title}</div>
              <div className={styles.continueMeta} style={{ marginTop: 6 }}>Estimated time: {nextLesson.time} minutes</div>
            </div>
            <div>
              <button onClick={() => router.push('/courses/1')} className={`${styles['neon-button']} ${styles.continueBtn}`}>Continue <span style={{marginLeft:8}}><Icons.ArrowRight size={16} /></span></button>
            </div>
          </div>

          <h3 style={{ marginTop: 22, color: '#fff' }}>Your Courses</h3>
          <div className={styles.courseGrid} style={{ marginTop: 12 }}>
            {enrolledCourses.map(c => (
              <div key={c.id} className={`${styles['neon-card']} ${styles.card} ${styles.courseCard}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className={styles.courseTitle}>{c.title}</div>
                    <div className={styles.courseMeta}>{c.level}</div>
                  </div>
                  <div className={styles.enrolledBadge}>Enrolled</div>
                </div>

                <div className={styles.authorRow}>
                  <div className={styles.authorLeft}><Icons.Book size={18} /><div className={styles.authorName}>{c.author}</div></div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.lessons} lessons</div>
                </div>

                <div className={styles.progress}><div className={styles.progressInner} style={{ width: c.progress + '%' }} /></div>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: 28, color: '#fff' }}>Achievements</h3>
          <div className={styles.achievements}>
            {mockAchievements.map(a => (
              <div key={a.id} className={styles.achievementCard}>
                <div className={styles.achievementIcon}>
                  {a.id === 'a1' ? <Icons.Target size={20} /> : a.id === 'a2' ? <Icons.Fire size={20} /> : <Icons.Book size={20} />}
                </div>
                <div className={styles.achievementLabel}>{a.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.description}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
