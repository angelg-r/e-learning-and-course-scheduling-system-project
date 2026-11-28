import { useEffect, useState } from 'react'
import { apiFetch } from '../../../config/api'
import CourseMaterialsSection from '../../../components/CourseMaterialsSection/CourseMaterialsSection'
import '../../Trainee/ELearningPortal/ELearningPortal.css'

const TRAINING_MODES = ['All', 'Office Training', 'Virtual Training', 'Group Training', '1-to-1 Training']

export default function CourseContentManagement() {
  const [courses, setCourses] = useState([])
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [trainingMode, setTrainingMode] = useState('Office Training')
  const [modulesCount, setModulesCount] = useState(3)
  const [price, setPrice] = useState(2500)
  const [search, setSearch] = useState('')
  const [modeFilter, setModeFilter] = useState('All')
  const [activeCourseId, setActiveCourseId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiFetch('/api/courses')
      .then((data) => { if (active) setCourses(data.courses || []) })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  const handleAdd = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const data = await apiFetch('/api/courses', {
        method: 'POST',
        body: JSON.stringify({ code, title, trainingMode, modulesCount: Number(modulesCount), price: Number(price) }),
      })
      setCourses((prev) => [data.course, ...prev])
      setCode('')
      setTitle('')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/courses/${id}`, { method: 'DELETE' })
      setCourses((prev) => prev.filter((item) => item._id !== id))
      if (activeCourseId === id) setActiveCourseId('')
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

  return (
    <section className="module-container">
      <h1>Course &amp; Self-Paced Content Management</h1>
      <p className="portal-subtitle">Create training courses, browse the course catalog, and manage self-paced materials.</p>
      {error && <p className="portal-notice portal-notice-error">{error}</p>}

      <form className="portal-form" onSubmit={handleAdd}>
        <div className="portal-form-grid">
          <div className="portal-field">
            <label htmlFor="course-code">Course Code</label>
            <input id="course-code" placeholder="e.g. GRTI-101" value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <div className="portal-field">
            <label htmlFor="course-title">Course Title</label>
            <input id="course-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="portal-field">
            <label htmlFor="course-mode">Training Mode</label>
            <select id="course-mode" value={trainingMode} onChange={(e) => setTrainingMode(e.target.value)}>
              <option>Office Training</option>
              <option>Virtual Training</option>
              <option>Group Training</option>
              <option>1-to-1 Training</option>
            </select>
          </div>
          <div className="portal-field">
            <label htmlFor="course-mods">Self-Paced Modules</label>
            <input id="course-mods" type="number" min={1} value={modulesCount} onChange={(e) => setModulesCount(e.target.value)} required />
          </div>
          <div className="portal-field">
            <label htmlFor="course-price">Training Fee (PHP)</label>
            <input id="course-price" type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
        </div>
        <div className="portal-form-actions">
          <button type="submit" className="portal-btn">Add Course</button>
        </div>
      </form>

      <h2 className="portal-section-title">Course Catalog</h2>
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
        <p className="portal-notice">No courses added yet.</p>
      ) : (
        <div className="academy-grid">
          {filtered.map((c) => {
            const total = c.materials?.length || 0
            return (
              <article key={c._id} className="academy-card">
                <div className="academy-card-banner">
                  <div className="academy-card-top">
                    <span className="academy-code-badge">{c.code}</span>
                    <span className="academy-mode-tag">{c.trainingMode}</span>
                  </div>
                  <h2 className="academy-card-title">{c.title}</h2>
                </div>

                <div className="academy-card-body">
                  <div className="academy-card-meta">
                    <span>{c.modulesCount} Modules &bull; {total} Material{total === 1 ? '' : 's'}</span>
                    <span>{c.price ? `PHP ${Number(c.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : 'Free'}</span>
                  </div>

                  <div className="academy-card-actions">
                    <button
                      type="button"
                      className="portal-btn portal-btn-sm"
                      onClick={() => setActiveCourseId(c._id)}
                    >
                      View Materials
                    </button>
                    <button
                      type="button"
                      className="portal-btn portal-btn-sm portal-btn-danger"
                      onClick={() => handleDelete(c._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {activeCourse && (
        <div className="portal-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="admin-course-modal">
          <div className="portal-modal-card">
            <div className="portal-modal-header">
              <div>
                <span className="portal-badge portal-badge-success">{activeCourse.code}</span>
                <h2 id="admin-course-modal" style={{ marginTop: '0.4rem' }}>{activeCourse.title}</h2>
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
                {activeCourse.materials.map((m) => (
                  <li key={m._id} className="academy-material-item">
                    <div className="academy-material-info">
                      <strong>{m.title}</strong>
                      <span className="portal-badge portal-badge-neutral" style={{ alignSelf: 'flex-start' }}>
                        {m.format}
                      </span>
                    </div>
                    <a href={m.link} target="_blank" rel="noreferrer" className="portal-btn portal-btn-sm">
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

      <CourseMaterialsSection courses={courses} setCourses={setCourses} onError={setError} />
    </section>
  )
}
