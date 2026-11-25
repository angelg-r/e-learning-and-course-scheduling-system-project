import { useEffect, useState } from 'react'
import { apiFetch } from '../../../config/api'

export default function MyPlottedSchedule() {
  const [schedules, setSchedules] = useState([])
  const [filter, setFilter] = useState('All')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiFetch('/api/schedules?mine=true')
      .then((data) => { if (active) setSchedules(data.schedules || []) })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  const rows = schedules.filter((item) => filter === 'All' || item.status === filter)

  return (
    <section className="module-container">
      <h1>My Plotted Schedule</h1>
      <p className="portal-subtitle">View courses, venues, and slots assigned to your account.</p>
      {error && <p className="portal-notice portal-notice-error">{error}</p>}

      <div className="portal-toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Date</th>
              <th>Time Slot</th>
              <th>Venue</th>
              <th>Reserved</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6}>No assigned schedules yet.</td></tr>
            ) : rows.map((row) => (
              <tr key={row._id}>
                <td><strong>{row.course?.title}</strong></td>
                <td>{row.date}</td>
                <td>{row.slot}</td>
                <td>{row.venue?.name}</td>
                <td>{row.reservedCount} / {row.maxSlots}</td>
                <td><span className="portal-badge portal-badge-success">{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}