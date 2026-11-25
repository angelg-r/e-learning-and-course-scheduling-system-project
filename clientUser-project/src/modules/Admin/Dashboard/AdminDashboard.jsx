import { useEffect, useState } from 'react'
import { apiFetch } from '../../../config/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, courses: 0, schedules: 0, pending: 0 })
  const [recent, setRecent] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      apiFetch('/api/users'),
      apiFetch('/api/courses'),
      apiFetch('/api/schedules'),
      apiFetch('/api/reservations'),
    ])
      .then(([u, c, s, r]) => {
        if (!active) return
        const reservations = r.reservations || []
        setStats({
          users: (u.users || []).length,
          courses: (c.courses || []).length,
          schedules: (s.schedules || []).length,
          pending: reservations.filter((item) => item.status === 'Pending').length,
        })
        setRecent(reservations.slice(0, 6))
      })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  return (
    <section className="module-container">
      <h1>Admin Dashboard</h1>
      <p className="portal-subtitle">Live database summary across users, courses, schedules, and reservations.</p>
      {error && <p className="portal-notice portal-notice-error">{error}</p>}

      <div className="portal-stats">
        <div className="portal-stat-card">
          <span className="portal-stat-label">Total Users</span>
          <span className="portal-stat-value">{stats.users}</span>
        </div>
        <div className="portal-stat-card">
          <span className="portal-stat-label">Courses</span>
          <span className="portal-stat-value">{stats.courses}</span>
        </div>
        <div className="portal-stat-card">
          <span className="portal-stat-label">Plotted Schedules</span>
          <span className="portal-stat-value">{stats.schedules}</span>
        </div>
        <div className="portal-stat-card">
          <span className="portal-stat-label">Pending Reservations</span>
          <span className="portal-stat-value">{stats.pending}</span>
        </div>
      </div>

      <h2 className="portal-section-title">Recent Reservations</h2>
      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Trainee</th>
              <th>Course</th>
              <th>Schedule</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr><td colSpan={4}>No reservations yet.</td></tr>
            ) : recent.map((item) => (
              <tr key={item._id}>
                <td><strong>{item.trainee?.fullName}</strong></td>
                <td>{item.schedule?.course?.title}</td>
                <td>{item.schedule ? `${item.schedule.date} (${item.schedule.slot})` : '—'}</td>
                <td>
                  <span className={`portal-badge ${item.status === 'Confirmed' ? 'portal-badge-success' : 'portal-badge-warning'}`}>
                    {item.status}
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