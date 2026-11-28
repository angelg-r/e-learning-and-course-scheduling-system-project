import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { apiFetch } from '../../../config/api'
import './ELearningPortal.css'

const TRAINING_MODES = ['All', 'Office Training', 'Virtual Training', 'Group Training', '1-to-1 Training']

export default function ELearningPortal() {
  const [courses, setCourses] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [search, setSearch] = useState('')
  const [modeFilter, setModeFilter] = useState('All')
  const [activeCourseId, setActiveCourseId] = useState('')
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
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    const matchesMode = modeFilter === 'All' || c.trainingMode === modeFilter
    return matchesSearch && matchesMode
  })

  const activeCourse = courses.find((c) => c._id === activeCourseId) || null

  const getCourseStats = (course) => {
    const total = course.materials?.length || 0
    const record = progressMap[String(course._id)]
    const doneIds = new Set((record?.completedMaterials || []).map(String))
    const doneCount = course.materials?.filter((m) => doneIds.has(String(m._id))).length || 0
    const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0
    return { total, doneIds, doneCount, pct }
  }

  return (
    <section className="module-container">
      <h1>E-Learning Course Catalog</h1>
      <p className="portal-subtitle">
        Browse self-paced certification courses, track module completion, and launch 3D simulations.
      </p>
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
        <p className="portal-notice">No courses match your filters.</p>
      ) : (
        <div className="academy-grid">
          {filtered.map((course) => {
            const { total, doneCount, pct } = getCourseStats(course)
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
                    <span>{course.modulesCount} Modules &bull; {total} Material{total === 1 ? '' : 's'}</span>
                    <span>{course.price ? `PHP ${Number(course.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : 'Included'}</span>
                  </div>

                  <div className="academy-progress-wrap">
                    <div className="academy-card-meta">
                      <span>Progress</span>
                      <span>{total === 0 ? 'No uploads yet' : `${doneCount}/${total} (${pct}%)`}</span>
                    </div>
                    <div className="academy-progress-bar">
                      <div className="academy-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="academy-card-actions">
                    <button
                      type="button"
                      className="portal-btn portal-btn-sm"
                      onClick={() => setActiveCourseId(course._id)}
                    >
                      View Course
                    </button>
                    <Link
                      to={`/goodrespondertraininginstitute/trainee/portal/simulator/${course._id}`}
                      className="portal-btn portal-btn-sm portal-btn-secondary"
                    >
                      Launch 3D
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {activeCourse && (
        <div className="portal-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="course-modal-title">
          <div className="portal-modal-card">
            <div className="portal-modal-header">
              <div>
                <span className="portal-badge portal-badge-success">{activeCourse.code}</span>
                <h2 id="course-modal-title" style={{ marginTop: '0.4rem' }}>{activeCourse.title}</h2>
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
              {activeCourse.trainingMode} &bull; {activeCourse.modulesCount} Modules
            </p>

            {activeCourse.materials?.length ? (
              <ul className="academy-material-list">
                {activeCourse.materials.map((m) => {
                  const { doneIds } = getCourseStats(activeCourse)
                  const isDone = doneIds.has(String(m._id))
                  return (
                    <li key={m._id} className="academy-material-item">
                      <div className="academy-material-info">
                        <strong>{m.title}</strong>
                        <span className="portal-badge portal-badge-neutral" style={{ alignSelf: 'flex-start' }}>
                          {m.format}
                        </span>
                      </div>
                      <div className="portal-actions-cell">
                        <a
                          href={m.link}
                          target="_blank"
                          rel="noreferrer"
                          className="portal-btn portal-btn-sm portal-btn-secondary"
                        >
                          Open
                        </a>
                        <button
                          type="button"
                          className={`portal-btn portal-btn-sm ${isDone ? '' : 'portal-btn-secondary'}`}
                          onClick={() => handleToggleMaterial(activeCourse._id, m._id)}
                        >
                          {isDone ? '✓ Completed' : 'Mark Done'}
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="portal-notice">No learning materials uploaded for this course yet.</p>
            )}

            <div className="portal-form-actions">
              <Link
                to={`/goodrespondertraininginstitute/trainee/portal/simulator/${activeCourse._id}`}
                className="portal-btn"
              >
                Launch 3D Simulator
              </Link>
              <button
                type="button"
                className="portal-btn portal-btn-secondary"
                onClick={() => setActiveCourseId('')}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
