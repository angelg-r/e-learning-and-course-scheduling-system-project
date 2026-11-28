import { useState } from 'react'
import { apiFetch } from '../../config/api'

export default function CourseMaterialsSection({ courses, setCourses, onError }) {
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [title, setTitle] = useState('')
  const [format, setFormat] = useState('PDF')
  const [link, setLink] = useState('')
  const [notice, setNotice] = useState('')

  const activeCourseId = selectedCourseId || courses[0]?._id || ''

  const handleAddMaterial = async (event) => {
    event.preventDefault()
    if (!activeCourseId) return
    onError('')
    setNotice('')
    try {
      const data = await apiFetch(`/api/courses/${activeCourseId}/materials`, {
        method: 'POST',
        body: JSON.stringify({ title, format, link }),
      })
      setCourses((prev) => prev.map((c) => (c._id === activeCourseId ? data.course : c)))
      setTitle('')
      setLink('')
      setNotice('Course material added!')
    } catch (err) {
      onError(err.message)
    }
  }

  const handleRemoveMaterial = async (courseId, materialId) => {
    onError('')
    setNotice('')
    try {
      const data = await apiFetch(`/api/courses/${courseId}/materials/${materialId}`, {
        method: 'DELETE',
      })
      setCourses((prev) => prev.map((c) => (c._id === courseId ? data.course : c)))
    } catch (err) {
      onError(err.message)
    }
  }

  const allMaterials = courses.flatMap((c) =>
    (c.materials || []).map((m) => ({ ...m, courseId: c._id, courseTitle: c.title }))
  )

  return (
    <>
      <h2 className="portal-section-title">Course Materials Management</h2>
      <p className="portal-subtitle">Upload and manage self-paced learning links (PDF, Video, Slides) for each course.</p>
      {notice && <p className="portal-notice" role="status">{notice}</p>}

      <form className="portal-form" onSubmit={handleAddMaterial}>
        <div className="portal-form-grid">
          <div className="portal-field">
            <label htmlFor="admin-mat-course">Course</label>
            <select
              id="admin-mat-course"
              value={activeCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              required
            >
              {courses.length === 0 && <option value="">No courses available</option>}
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.code} — {c.title}</option>
              ))}
            </select>
          </div>
          <div className="portal-field">
            <label htmlFor="admin-mat-title">Material Title</label>
            <input
              id="admin-mat-title"
              placeholder="e.g. BLS Module 1 Handout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="portal-field">
            <label htmlFor="admin-mat-format">Format</label>
            <select id="admin-mat-format" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option>PDF</option>
              <option>Video</option>
              <option>Slides</option>
            </select>
          </div>
          <div className="portal-field">
            <label htmlFor="admin-mat-link">Resource URL</label>
            <input
              id="admin-mat-link"
              type="url"
              placeholder="https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="portal-form-actions">
          <button type="submit" className="portal-btn" disabled={!activeCourseId}>
            Add Course Material
          </button>
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
                  <button
                    type="button"
                    className="portal-btn portal-btn-sm portal-btn-danger"
                    onClick={() => handleRemoveMaterial(m.courseId, m._id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
