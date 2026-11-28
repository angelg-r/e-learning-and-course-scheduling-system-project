import { useEffect, useState } from 'react'
import { apiFetch } from '../../../config/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, courses: 0, schedules: 0, pending: 0 })
  const [recent, setRecent] = useState([])
  const [availabilityRequests, setAvailabilityRequests] = useState([])
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      apiFetch('/api/users'),
      apiFetch('/api/courses'),
      apiFetch('/api/schedules'),
      apiFetch('/api/reservations'),
      apiFetch('/api/availability'),
    ])
      .then(([u, c, s, r, a]) => {
        if (!active) return
        const reservations = r.reservations || []
        setStats({
          users: (u.users || []).length,
          courses: (c.courses || []).length,
          schedules: (s.schedules || []).length,
          pending: reservations.filter((item) => item.status === 'Pending').length,
        })
        setRecent(reservations.slice(0, 6))
        setAvailabilityRequests(a.requests || [])
      })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  const handleAvailabilityStatus = async (id, status) => {
    setError('')
    setNotice('')
    try {
      const data = await apiFetch(`/api/availability/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setAvailabilityRequests((prev) =>
        prev.map((item) => (item._id === id ? data.request : item))
      )
      setNotice(`Availability request marked as ${status}.`)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSendReminders = async () => {
    setError('')
    setNotice('')
    try {
      const data = await apiFetch('/api/notifications/reminders', { method: 'POST' })
      setNotice(data.message)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="module-container">
      <h1>Admin Dashboard</h1>
      <p className="portal-subtitle">Live database summary across users, courses, schedules, and reservations.</p>
      {error && <p className="portal-notice portal-notice-error">{error}</p>}
      {notice && <p className="portal-notice portal-notice-success">{notice}</p>}

      <div className="portal-toolbar">
        <button type="button" className="portal-btn" onClick={handleSendReminders}>
          Send Tomorrow&apos;s SMS/Email Reminders
        </button>
      </div>

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

      <h2 className="portal-section-title">Trainor Availability Requests</h2>
      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Trainor</th>
              <th>Date</th>
              <th>Time Window</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {availabilityRequests.length === 0 ? (
              <tr><td colSpan={6}>No availability requests yet.</td></tr>
            ) : availabilityRequests.map((reqItem) => (
              <tr key={reqItem._id}>
                <td><strong>{reqItem.trainor?.fullName || 'Trainor'}</strong></td>
                <td>{reqItem.date}</td>
                <td>{reqItem.slot}</td>
                <td>{reqItem.reason}</td>
                <td>
                  <span className={`portal-badge ${reqItem.status === 'Approved' ? 'portal-badge-success' : reqItem.status === 'Declined' ? 'portal-badge-neutral' : 'portal-badge-warning'}`}>
                    {reqItem.status}
                  </span>
                </td>
                <td className="portal-actions-cell">
                  {reqItem.status !== 'Approved' && (
                    <button
                      type="button"
                      className="portal-btn portal-btn-sm"
                      onClick={() => handleAvailabilityStatus(reqItem._id, 'Approved')}
                    >
                      Approve
                    </button>
                  )}
                  {reqItem.status !== 'Declined' && (
                    <button
                      type="button"
                      className="portal-btn portal-btn-sm portal-btn-danger"
                      onClick={() => handleAvailabilityStatus(reqItem._id, 'Declined')}
                    >
                      Decline
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
