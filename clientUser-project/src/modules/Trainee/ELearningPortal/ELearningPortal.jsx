import { useEffect, useState } from 'react'
import { apiFetch } from '../../../config/api'

export default function ELearningPortal() {
  const [courses, setCourses] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [search, setSearch] = useState('')
  const [modeFilter, setModeFilter] = useState('All')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([apiFetch('/api/courses'), apiFetch('/api/progress')])
      .then(([courseRes, progressRes]) => {
        if (!active) return
        setCourses(courseRes.courses || [])
        const map = {}
        for (const item of progressRes.progress || []) {
          map[String(item.course)] = item
        }
        setProgressMap(map)
      })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  const handleToggleMaterial = async (courseId, materialId) => {
    setError('')
    try {
      const data = await apiFetch('/api/progress/toggle', {
        method: 'POST',
        body: JSON.stringify({ courseId, materialId }),
      })
      setProgressMap((prev) => ({
        ...prev,
        [String(courseId)]: data.progress,
      }))
    } catch (err) {
      setError(err.message)
    }
  }

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
    const matchesMode = modeFilter === 'All' || c.trainingMode === modeFilter
    return matchesSearch && matchesMode
  })

  return (
    <section className="module-container">
      <h1>E-Learning Portal &amp; Self-Paced Modules</h1>
      <p className="portal-subtitle">Browse available courses, open uploaded learning materials, and track your completion progress.</p>
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
              <th>Progress</th>
              <th>Materials</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5}>No courses found.</td></tr>
            ) : filtered.map((course) => {
              const total = course.materials?.length || 0
              const record = progressMap[String(course._id)]
              const doneIds = new Set((record?.completedMaterials || []).map(String))
              const doneCount = course.materials?.filter((m) => doneIds.has(String(m._id))).length || 0
              const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

              return (
                <tr key={course._id}>
                  <td>{course.code}</td>
                  <td><strong>{course.title}</strong></td>
                  <td>{course.trainingMode}</td>
                  <td>
                    {total === 0 ? (
                      <span className="portal-badge portal-badge-neutral">No materials</span>
                    ) : (
                      <span className={`portal-badge ${doneCount === total ? 'portal-badge-success' : doneCount > 0 ? 'portal-badge-warning' : 'portal-badge-neutral'}`}>
                        {doneCount}/{total} ({pct}%)
                      </span>
                    )}
                  </td>
                  <td>
                    {total ? (
                      <div className="portal-actions-cell">
                        {course.materials.map((m) => {
                          const isDone = doneIds.has(String(m._id))
                          return (
                            <div key={m._id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <a href={m.link} target="_blank" rel="noreferrer" className="portal-btn portal-btn-sm portal-btn-secondary">
                                {m.title} ({m.format})
                              </a>
                              <button
                                type="button"
                                className={`portal-btn portal-btn-sm ${isDone ? '' : 'portal-btn-secondary'}`}
                                onClick={() => handleToggleMaterial(course._id, m._id)}
                              >
                                {isDone ? '✓ Completed' : 'Mark Done'}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    ) : 'No uploads yet'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
