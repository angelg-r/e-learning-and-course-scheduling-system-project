import { useEffect, useState } from 'react'
import { apiFetch } from '../../../config/api'

export default function CourseMaterials() {
  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState('')
  const [title, setTitle] = useState('')
  const [format, setFormat] = useState('PDF')
  const [link, setLink] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiFetch('/api/courses')
      .then((data) => {
        if (!active) return
        const list = data.courses || []
        setCourses(list)
        if (list.length > 0) setCourseId(list[0]._id)
      })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  const handleAdd = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const data = await apiFetch(`/api/courses/${courseId}/materials`, {
        method: 'POST',
        body: JSON.stringify({ title, format, link }),
      })
      setCourses((prev) => prev.map((c) => (c._id === courseId ? data.course : c)))
      setTitle('')
      setLink('')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRemove = async (cId, matId) => {
    try {
      const data = await apiFetch(`/api/courses/${cId}/materials/${matId}`, { method: 'DELETE' })
      setCourses((prev) => prev.map((c) => (c._id === cId ? data.course : c)))
    } catch (err) {
      setError(err.message)
    }
  }

  const allMaterials = courses.flatMap((c) =>
    (c.materials || []).map((m) => ({ ...m, courseId: c._id, courseTitle: c.title }))
  )

  return (
    <section className="module-container">
      <h1>Course Materials Management</h1>
      <p className="portal-subtitle">Upload and manage self-paced learning links for courses.</p>
      {error && <p className="portal-notice portal-notice-error">{error}</p>}

      <form className="portal-form" onSubmit={handleAdd}>
        <div className="portal-form-grid">
          <div className="portal-field">
            <label htmlFor="mat-course">Course</label>
            <select id="mat-course" value={courseId} onChange={(e) => setCourseId(e.target.value)} required>
              {courses.length === 0 && <option value="">No courses available</option>}
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div className="portal-field">
            <label htmlFor="mat-title">Material Title</label>
            <input id="mat-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="portal-field">
            <label htmlFor="mat-format">Format</label>
            <select id="mat-format" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option>PDF</option>
              <option>Video</option>
              <option>Slides</option>
            </select>
          </div>
          <div className="portal-field">
            <label htmlFor="mat-link">Resource URL</label>
            <input id="mat-link" type="url" value={link} onChange={(e) => setLink(e.target.value)} required />
          </div>
        </div>
        <div className="portal-form-actions">
          <button type="submit" className="portal-btn" disabled={!courseId}>Add Material</button>
        </div>
      </form>

      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Title</th>
              <th>Format</th>
              <th>Link</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allMaterials.length === 0 ? (
              <tr><td colSpan={5}>No materials uploaded yet.</td></tr>
            ) : allMaterials.map((m) => (
              <tr key={m._id}>
                <td>{m.courseTitle}</td>
                <td><strong>{m.title}</strong></td>
                <td><span className="portal-badge portal-badge-neutral">{m.format}</span></td>
                <td><a href={m.link} target="_blank" rel="noreferrer">Open</a></td>
                <td>
                  <button type="button" className="portal-btn portal-btn-sm portal-btn-danger" onClick={() => handleRemove(m.courseId, m._id)}>
                    Remove
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