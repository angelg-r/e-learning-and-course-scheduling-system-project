import { useEffect, useState } from 'react'
import { apiFetch } from '../../../config/api'

export default function CourseContentManagement() {
  const [courses, setCourses] = useState([])
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [trainingMode, setTrainingMode] = useState('Office Training')
  const [modulesCount, setModulesCount] = useState(3)
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
        body: JSON.stringify({ code, title, trainingMode, modulesCount: Number(modulesCount) }),
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
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="module-container">
      <h1>Course &amp; Self-Paced Content Management</h1>
      <p className="portal-subtitle">Create training courses saved in MongoDB.</p>
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
        </div>
        <div className="portal-form-actions">
          <button type="submit" className="portal-btn">Add Course</button>
        </div>
      </form>

      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Course Title</th>
              <th>Mode</th>
              <th>Modules</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr><td colSpan={5}>No courses added yet.</td></tr>
            ) : courses.map((c) => (
              <tr key={c._id}>
                <td>{c.code}</td>
                <td><strong>{c.title}</strong></td>
                <td>{c.trainingMode}</td>
                <td>{c.modulesCount}</td>
                <td>
                  <button type="button" className="portal-btn portal-btn-sm portal-btn-danger" onClick={() => handleDelete(c._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}