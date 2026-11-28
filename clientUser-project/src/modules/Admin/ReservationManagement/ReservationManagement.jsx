import { useEffect, useState } from 'react'
import { apiFetch } from '../../../config/api'

export default function ReservationManagement() {
  const [reservations, setReservations] = useState([])
  const [filter, setFilter] = useState('All')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiFetch('/api/reservations')
      .then((data) => { if (active) setReservations(data.reservations || []) })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/api/reservations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setReservations((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)))
    } catch (err) {
      setError(err.message)
    }
  }

  const rows = reservations.filter((r) => filter === 'All' || r.status === filter)

  return (
    <section className="module-container">
      <h1>Reservation Management</h1>
      <p className="portal-subtitle">Confirm or cancel trainee schedule reservations in MongoDB.</p>
      {error && <p className="portal-notice portal-notice-error">{error}</p>}

      <div className="portal-toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All Reservations</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Trainee</th>
              <th>Course</th>
              <th>Schedule</th>
              <th>Venue</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6}>No reservations found.</td></tr>
            ) : rows.map((r) => (
              <tr key={r._id}>
                <td><strong>{r.trainee?.fullName}</strong></td>
                <td>{r.schedule?.course?.title}</td>
                <td>{r.schedule ? `${r.schedule.date} (${r.schedule.slot})` : '—'}</td>
                <td>{r.schedule?.venue?.name}</td>
                <td>
                  <span className={`portal-badge ${r.status === 'Confirmed' ? 'portal-badge-success' : r.status === 'Pending' ? 'portal-badge-warning' : 'portal-badge-neutral'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="portal-actions-cell">
                  {r.status !== 'Confirmed' && (
                    <button type="button" className="portal-btn portal-btn-sm" onClick={() => updateStatus(r._id, 'Confirmed')}>
                      Confirm
                    </button>
                  )}
                  {r.status !== 'Cancelled' && (
                    <button type="button" className="portal-btn portal-btn-sm portal-btn-danger" onClick={() => updateStatus(r._id, 'Cancelled')}>
                      Cancel
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
