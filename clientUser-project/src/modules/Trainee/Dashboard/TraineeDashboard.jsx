import { useEffect, useState } from 'react'
import { apiFetch } from '../../../config/api'

export default function TraineeDashboard() {
  const [courses, setCourses] = useState([])
  const [reservations, setReservations] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([apiFetch('/api/courses'), apiFetch('/api/reservations')])
      .then(([courseRes, resRes]) => {
        if (!active) return
        setCourses(courseRes.courses || [])
        setReservations(resRes.reservations || [])
      })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  const activeReservations = reservations.filter((r) => r.status !== 'Cancelled')
  const confirmedCount = reservations.filter((r) => r.status === 'Confirmed').length

  return (
    <section className="module-container">
      <h1>Trainee Dashboard</h1>
      <p className="portal-subtitle">Overview of available courses and your reserved schedules.</p>
      {error && <p className="portal-notice portal-notice-error">{error}</p>}

      <div className="portal-stats">
        <div className="portal-stat-card">
          <span className="portal-stat-label">Available Courses</span>
          <span className="portal-stat-value">{courses.length}</span>
        </div>
        <div className="portal-stat-card">
          <span className="portal-stat-label">Active Reservations</span>
          <span className="portal-stat-value">{activeReservations.length}</span>
        </div>
        <div className="portal-stat-card">
          <span className="portal-stat-label">Confirmed Sessions</span>
          <span className="portal-stat-value">{confirmedCount}</span>
        </div>
      </div>

      <h2 className="portal-section-title">My Upcoming Reservations</h2>
      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Date &amp; Time</th>
              <th>Venue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr><td colSpan={4}>No reservations yet.</td></tr>
            ) : reservations.map((r) => (
              <tr key={r._id}>
                <td><strong>{r.schedule?.course?.title || 'Course'}</strong></td>
                <td>{r.schedule ? `${r.schedule.date} (${r.schedule.slot})` : '—'}</td>
                <td>{r.schedule?.venue?.name || '—'}</td>
                <td>
                  <span className={`portal-badge ${r.status === 'Confirmed' ? 'portal-badge-success' : r.status === 'Pending' ? 'portal-badge-warning' : 'portal-badge-neutral'}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}