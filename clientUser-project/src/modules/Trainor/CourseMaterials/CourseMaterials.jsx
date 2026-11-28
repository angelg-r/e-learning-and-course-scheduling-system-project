import { useEffect, useState } from 'react'
import { apiFetch } from '../../../config/api'
import '../../Trainee/ELearningPortal/ELearningPortal.css'

const TRAINING_MODES = ['All', 'Office Training', 'Virtual Training', 'Group Training', '1-to-1 Training']

export default function CourseMaterials() {
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [modeFilter, setModeFilter] = useState('All')
  const [activeCourseId, setActiveCourseId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiFetch('/api/courses')
      .then((data) => {
        if (!active) return
        setCourses(data.courses || [])
      })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    const matchesMode = modeFilter === 'All' || c.trainingMode === modeFilter
    return matchesSearch && matchesMode
  })

  const activeCourse = courses.find((c) => c._id === activeCourseId) || null

  return (
    <section className="module-container">
      <h1>Course Materials Catalog</h1>
      <p className="portal-subtitle">Browse all GRTI courses and view Admin-uploaded self-paced learning materials.</p>
      {error && <p className="portal-notice portal-notice-error">{error}</p>}

      <div className="academy-filter-bar">
        <div className="academy-mode-pills" role="group" aria-label="Filter by training mode">
          {TRAINING_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              className={`academy-pill ${modeFilter === mode ? 'is-active' : ''}`}
              onClick={() => setModeFilter(mode)}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="portal-toolbar" style={{ margin: 0 }}>
          <input
            type="search"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {(search || modeFilter !== 'All') && (
            <button
              type="button"
              className="portal-btn portal-btn-sm portal-btn-secondary"
              onClick={() => {
                setSearch('')
                setModeFilter('All')
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="portal-notice">No courses found.</p>
      ) : (
        <div className="academy-grid">
          {filtered.map((course) => {
            const total = course.materials?.length || 0
            return (
              <article key={course._id} className="academy-card">
                <div className="academy-card-banner">
                  <div className="academy-card-top">
                    <span className="academy-code-badge">{course.code}</span>
                    <span className="academy-mode-tag">{course.trainingMode}</span>
                  </div>
                  <h2 className="academy-card-title">{course.title}</h2>
                </div>

                <div className="academy-card-body">
                  <div className="academy-card-meta">
                    <span>{course.modulesCount} Self-Paced Modules</span>
                    <span>{total} Material{total === 1 ? '' : 's'}</span>
                  </div>

                  <div className="academy-card-actions">
                    <button
                      type="button"
                      className="portal-btn portal-btn-sm"
                      onClick={() => setActiveCourseId(course._id)}
                    >
                      View Materials
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {activeCourse && (
        <div className="portal-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="trainor-course-modal">
          <div className="portal-modal-card">
            <div className="portal-modal-header">
              <div>
                <span className="portal-badge portal-badge-success">{activeCourse.code}</span>
                <h2 id="trainor-course-modal" style={{ marginTop: '0.4rem' }}>{activeCourse.title}</h2>
              </div>
              <button
                type="button"
                className="portal-btn portal-btn-sm portal-btn-secondary"
                onClick={() => setActiveCourseId('')}
              >
                Close
              </button>
            </div>

            <p className="portal-subtitle">
              {activeCourse.trainingMode} &bull; {activeCourse.modulesCount} Modules (Managed by Admin)
            </p>

            {activeCourse.materials?.length ? (
              <ul className="academy-material-list">
                {activeCourse.materials.map((m) => (
                  <li key={m._id} className="academy-material-item">
                    <div className="academy-material-info">
                      <strong>{m.title}</strong>
                      <span className="portal-badge portal-badge-neutral" style={{ alignSelf: 'flex-start' }}>
                        {m.format}
                      </span>
                    </div>
                    <a
                      href={m.link}
                      target="_blank"
                      rel="noreferrer"
                      className="portal-btn portal-btn-sm"
                    >
                      Open
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="portal-notice">No materials uploaded for this course yet.</p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
