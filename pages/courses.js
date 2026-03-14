import {useState, useMemo} from 'react'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import Header from '../components/Header'
import Icons from '../components/Icons'

const sampleCourses = [
  {id:1,title:'Intro to JavaScript',level:'Beginner',desc:'Master the fundamentals of JavaScript programming.',lessons:12,progress:65},
  {id:2,title:'Python Basics',level:'Beginner',desc:'Start your Python journey with this beginner-friendly course.',lessons:10,progress:20},
  {id:3,title:'React Fundamentals',level:'Intermediate',desc:'Build modern web applications with React.',lessons:15,progress:0},
  {id:4,title:'Data Structures & Algorithms',level:'Intermediate',desc:'Master essential data structures and algorithms.',lessons:20,progress:0},
  {id:5,title:'CSS Mastery',level:'Beginner',desc:'Create beautiful layouts with modern CSS.',lessons:8,progress:0},
  {id:6,title:'Machine Learning Basics',level:'Advanced',desc:'Intro to machine learning concepts and algorithms.',lessons:18,progress:0}
]

export default function Courses(){
  const [filter,setFilter] = useState('All')
  const [query,setQuery] = useState('')

  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase()
    return sampleCourses.filter(c=>{
      if(filter !== 'All' && c.level !== filter) return false
      if(!q) return true
      return c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
    })
  },[filter,query])

  const suggestions = sampleCourses.slice(0,3)

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div style={{maxWidth:1220,width:'100%'}}>
          <p style={{color:'#cfd7ff',marginBottom:8}}>Discover your next learning adventure from our collection of courses</p>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <input className={styles.searchInput} placeholder="Search courses..." value={query} onChange={e=>setQuery(e.target.value)} />
          </div>

          <div className={styles.tabs} style={{marginTop:12}}>
            {['All','Beginner','Intermediate','Advanced'].map(t=> (
              <button key={t} className={t===filter?`${styles.tab} active`:styles.tab} onClick={()=>setFilter(t)}>{t}</button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className={styles.noResults}>
              <h3>No courses found for "{query}"</h3>
              <p>Here are some relevant courses you can take instead:</p>
              <div className={styles.courseGrid} style={{marginTop:16}}>
                {suggestions.map(c=> (
                  <div key={c.id} className={styles.card} style={{padding:18}}>
                    <div className={styles.courseTitle}>{c.title}</div>
                    <div className={styles.courseMeta}>{c.level} • {c.lessons} lessons</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.courseGrid}>
              {filtered.map(c=> (
                <div key={c.id} className={styles.card + ' ' + styles.courseCard}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div className={styles.courseTitle}>{c.title}</div>
                      <div className={styles.courseMeta}>{c.desc}</div>
                    </div>
                    <div>
                      {c.progress > 0 && <div className={styles.enrolledBadge}>Enrolled</div>}
                    </div>
                  </div>

                  <div className={styles.authorRow}>
                    <div className={styles.authorLeft}><Icons.Pen size={18} /><div className={styles.authorName}>Instructor</div></div>
                    <div style={{fontSize:12,color:'var(--muted)'}}>{c.lessons} lessons</div>
                  </div>

                  <div className={styles.progress}><div className={styles.progressInner} style={{width:c.progress + '%'}} /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
