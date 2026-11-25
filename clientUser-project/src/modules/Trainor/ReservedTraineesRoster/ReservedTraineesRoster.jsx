import { useEffect, useState } from 'react'
import { apiFetch } from '../../../config/api'

export default function ReservedTraineesRoster() {
  const [reservations, setReservations] = useState([])
  const [selectedSchedule, setSelectedSchedule] = useState('all')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiFetch('/api/reservations')
      .then((data) => { if (active) setReservations(data.reservations || []) })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  const toggleAttendance = async (id, current) => {
    const next = current === 'Present' ? 'Absent' : 'Present'
    try {
      await apiFetch(`/api/reservations/${id}/attendance`, {
        method: 'PATCH',
        body: JSON.stringify({ attendance: next }),
      })
      setReservations((prev) => prev.map((r) => (r._id === id ? { ...r, attendance: next } : r)))
    } catch (err) {
      setError(err.message)
    }
  }

  const scheduleOptions = Array.from(
    new Map(
      reservations
        .filter((r) => r.schedule)
        .map((r) => [r.schedule._id, `${r.schedule.course?.title} — ${r.schedule.date}`])
    ).entries()
  )

  const rows = reservations.filter(
    (r) => selectedSchedule === 'all' || r.schedule?._id === selectedSchedule
  )

  return (
    <section className="module-container">
      <h1>Reserved Trainees Roster</h1>
      <p className="portal-subtitle">Review trainees booked in your classes and record attendance.</p>
      {error && <p className="portal-notice portal-notice-error">{error}</p>}

      <div className="portal-toolbar">
        <select value={selectedSchedule} onChange={(e) => setSelectedSchedule(e.target.value)}>
          <option value="all">All My Schedules</option>
          {scheduleOptions.map(([id, label]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
      </div>

      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Trainee</th>
              <th>Email</th>
              <th>Course &amp; Date</th>
              <th>Attendance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5}>No reserved trainees yet.</td></tr>
            ) : rows.map((r) => (
              <tr key={r._id}>
                <td><strong>{r.trainee?.fullName}</strong></td>
                <td>{r.trainee?.email}</td>
                <td>{r.schedule?.course?.title} ({r.schedule?.date})</td>
                <td>
                  <span className={`portal-badge ${r.attendance === 'Present' ? 'portal-badge-success' : 'portal-badge-warning'}`}>
                    {r.attendance}
                  </span>
                </td>
                <td>
                  <button type="button" className="portal-btn portal-btn-sm" onClick={() => toggleAttendance(r._id, r.attendance)}>
                    Toggle Present
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