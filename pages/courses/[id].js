import { useRouter } from 'next/router'
import styles from '../../styles/Home.module.css'
import Link from 'next/link'
import Header from '../../components/Header'
import Icons from '../../components/Icons'

const sampleLessons = [
  { id: 1, title: 'Introduction to JavaScript', minutes: 15, status: 'completed' },
  { id: 2, title: 'Variables and Data Types', minutes: 20, status: 'completed' },
  { id: 3, title: 'Functions', minutes: 25, status: 'completed' },
  { id: 4, title: 'Arrays', minutes: 30, status: 'locked' },
  { id: 5, title: 'Loops', minutes: 20, status: 'locked' }
]

export default function CourseDetail() {
  const router = useRouter()
  const { id } = router.query

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div style={{ maxWidth: 1100, width: '100%' }}>
          <div className={`${styles['gradient-card']} ${styles.courseHeader}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 6 }}>Intro to JavaScript</div>
                <div style={{ color: 'var(--muted)', marginBottom: 6 }}>Master the fundamentals of JavaScript programming. Learn variables, functions, arrays, and more in this comprehensive beginner course.</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <div style={{ color: 'var(--muted)', fontSize: 13 }}>by Sarah Chen</div>
                  <div style={{ color: 'var(--muted)', fontSize: 13 }}>12 lessons</div>
                  <div className={styles.enrolledBadge}>Beginner</div>
                </div>
              </div>

              <div>
                <button className={styles.signupBtn} onClick={() => router.push('/courses')}>Unenroll</button>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div className={styles.progress}>
                <div className={styles.progressInner} style={{ width: '65%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', marginTop: 6 }}>
                <div>Your Progress</div>
                <div>8 of 12 lessons completed</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 360px', gap: 22, marginTop: 22 }}>
            <div>
              <div className={`${styles['gradient-card']} ${styles.lessonListCard}`}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Course Lessons</div>
                <div className={styles.lessonList}>
                  {sampleLessons.map(l => (
                    <div key={l.id} className={`${styles.lessonItem} ${l.status === 'completed' ? styles.completed : ''}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className={styles.lessonIcon}>{l.status === 'completed' ? <Icons.Check /> : l.id}</div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{l.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{l.minutes} min {l.status === 'completed' ? ' · Completed' : ''}</div>
                        </div>
                      </div>
                      <div style={{ color: 'var(--muted)' }}><Icons.ArrowRight /></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${styles['gradient-card']}`} style={{ marginTop: 18 }}>
                <div style={{ color: 'var(--muted)', marginBottom: 12 }}>JavaScript is a versatile programming language that powers the modern web...</div>
                <pre style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, color: '#3fe0ff' }}>
{`// Example: Working with Introduction to JavaScript
function example() {
  console.log("Understanding Introduction to JavaScript");
  // Add your code here
}

example();`}
                </pre>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 800, color: '#fff', marginBottom: 8 }}>Key Takeaways</div>
                  <ul style={{ color: 'var(--muted)' }}>
                    <li>Master the fundamentals of Introduction to JavaScript</li>
                    <li>Apply concepts through practical examples</li>
                    <li>Build confidence with hands-on practice</li>
                  </ul>
                </div>

                  <div style={{ marginTop: 18 }}>
                  <div style={{ fontWeight: 800, color: '#fff', marginBottom: 8 }}>Discussion</div>
                  <textarea className={styles.searchInput} placeholder="Ask a question or share your thoughts..." />
                  <div style={{ marginTop: 12 }}>
                    <button className={styles['neon-button']}>Post Comment</button>
                  </div>
                </div>
              </div>
            </div>

            <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className={`${styles['gradient-card']}`}>
                <div style={{ fontWeight: 800, color: '#fff', marginBottom: 8 }}>Ask BrainByte AI</div>
                <div style={{ color: 'var(--muted)', marginBottom: 8 }}>Have a question about this lesson? Ask our AI assistant for help!</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className={styles.searchInput} placeholder="e.g., Why is recursion useful" />
                  <button className={styles['neon-button']}>Ask</button>
                </div>
              </div>

              <div className={`${styles['gradient-card']}`}>
                <div style={{ fontWeight: 700, color: 'var(--muted)' }}>Next Lesson</div>
                <div style={{ marginTop: 8, fontWeight: 800, color: '#fff' }}>Variables and Data Types</div>
                <div style={{ marginTop: 12 }}>
                  <button className={`${styles['neon-button']} ${styles.continueBtn}`} onClick={() => router.push('/courses/1')}>Continue <span style={{marginLeft:8}}><Icons.ArrowRight size={16} /></span></button>
                </div>
              </div>

              <div className={`${styles['gradient-card']}`}>
                <div style={{ fontWeight: 800, color: '#fff', marginBottom: 8 }}>Course Lessons</div>
                <div style={{ color: 'var(--muted)' }}>
                  <ol style={{ paddingLeft: 16, margin: 0 }}>
                    {sampleLessons.map(l => (
                      <li key={l.id} style={{ margin: '6px 0', color: l.status === 'completed' ? '#8eeaff' : 'var(--muted)' }}>{l.id}. {l.title}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
