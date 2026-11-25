import { useState } from 'react'

export default function ReservationManagement() {
  const [reservations, setReservations] = useState([
    { id: 1, trainee: 'Juan Dela Cruz', course: 'Basic Life Support (BLS)', date: '2026-12-02 09:00 AM', venue: 'Room 101', status: 'Pending' },
    { id: 2, trainee: 'Maria Clara', course: 'First Aid & CPR', date: '2026-12-05 01:00 PM', venue: 'Virtual Room A', status: 'Confirmed' },
  ])
  const [filter, setFilter] = useState('All')

  const updateStatus = (id, status) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  const rows = reservations.filter((r) => filter === 'All' || r.status === filter)

  return (
    <section className="module-container">
      <h1>Reservation Management</h1>
      <p className="portal-subtitle">Approve, confirm, or cancel trainee schedule reservations.</p>

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
            {rows.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.trainee}</strong></td>
                <td>{r.course}</td>
                <td>{r.date}</td>
                <td>{r.venue}</td>
                <td>
                  <span className={`portal-badge ${r.status === 'Confirmed' ? 'portal-badge-success' : r.status === 'Pending' ? 'portal-badge-warning' : 'portal-badge-neutral'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="portal-actions-cell">
                  {r.status !== 'Confirmed' && (
                    <button type="button" className="portal-btn portal-btn-sm" onClick={() => updateStatus(r.id, 'Confirmed')}>
                      Confirm
                    </button>
                  )}
                  {r.status !== 'Cancelled' && (
                    <button type="button" className="portal-btn portal-btn-sm portal-btn-danger" onClick={() => updateStatus(r.id, 'Cancelled')}>
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