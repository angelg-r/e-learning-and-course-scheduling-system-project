import { useEffect, useState } from 'react'
import { apiFetch } from '../../../config/api'

export default function ELearningPortal() {
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [modeFilter, setModeFilter] = useState('All')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiFetch('/api/courses')
      .then((data) => { if (active) setCourses(data.courses || []) })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
    const matchesMode = modeFilter === 'All' || c.trainingMode === modeFilter
    return matchesSearch && matchesMode
  })

  return (
    <section className="module-container">
      <h1>E-Learning Portal &amp; Self-Paced Modules</h1>
      <p className="portal-subtitle">Browse available courses and open uploaded learning materials.</p>
      {error && <p className="portal-notice portal-notice-error">{error}</p>}

      <div className="portal-toolbar">
        <input type="search" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
          <option value="All">All Modes</option>
          <option value="Office Training">Office Training</option>
          <option value="Virtual Training">Virtual Training</option>
          <option value="Group Training">Group Training</option>
          <option value="1-to-1 Training">1-to-1 Training</option>
        </select>
      </div>

      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Course</th>
              <th>Mode</th>
              <th>Modules</th>
              <th>Materials</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5}>No courses found.</td></tr>
            ) : filtered.map((course) => (
              <tr key={course._id}>
                <td>{course.code}</td>
                <td><strong>{course.title}</strong></td>
                <td>{course.trainingMode}</td>
                <td>{course.modulesCount}</td>
                <td>
                  {course.materials?.length ? (
                    <div className="portal-actions-cell">
                      {course.materials.map((m) => (
                        <a key={m._id} href={m.link} target="_blank" rel="noreferrer" className="portal-btn portal-btn-sm portal-btn-secondary">
                          {m.title} ({m.format})
                        </a>
                      ))}
                    </div>
                  ) : 'No uploads yet'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}