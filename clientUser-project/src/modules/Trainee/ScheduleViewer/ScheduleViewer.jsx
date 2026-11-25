import { useEffect, useState } from 'react'
import { apiFetch } from '../../../config/api'

export default function ScheduleViewer() {
  const [schedules, setSchedules] = useState([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiFetch('/api/schedules')
      .then((data) => { if (active) setSchedules(data.schedules || []) })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  const filtered = schedules.filter((s) => {
    const text = `${s.course?.title || ''} ${s.trainor?.fullName || ''} ${s.venue?.name || ''}`.toLowerCase()
    return text.includes(query.toLowerCase())
  })

  return (
    <section className="module-container">
      <h1>Course Schedule Viewer</h1>
      <p className="portal-subtitle">View open training schedules, assigned trainors, and venues.</p>
      {error && <p className="portal-notice portal-notice-error">{error}</p>}

      <div className="portal-toolbar">
        <input type="search" placeholder="Filter by course, trainor, or venue..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Trainor</th>
              <th>Venue</th>
              <th>Date</th>
              <th>Time Slot</th>
              <th>Open Slots</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6}>No plotted schedules found.</td></tr>
            ) : filtered.map((item) => (
              <tr key={item._id}>
                <td><strong>{item.course?.title}</strong></td>
                <td>{item.trainor?.fullName}</td>
                <td>{item.venue?.name}</td>
                <td>{item.date}</td>
                <td>{item.slot}</td>
                <td><span className="portal-badge portal-badge-success">{item.openSlots} left</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}