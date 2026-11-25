import { useEffect, useState } from 'react'
import { apiFetch } from '../../../config/api'

export default function OnlineReservation() {
  const [schedules, setSchedules] = useState([])
  const [reservations, setReservations] = useState([])
  const [scheduleId, setScheduleId] = useState('')
  const [trainingMode, setTrainingMode] = useState('Office Training')
  const [notes, setNotes] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([apiFetch('/api/schedules'), apiFetch('/api/reservations')])
      .then(([schedRes, resRes]) => {
        if (!active) return
        const list = schedRes.schedules || []
        setSchedules(list)
        if (list.length > 0) setScheduleId(list[0]._id)
        setReservations(resRes.reservations || [])
      })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  const handleReserve = async (event) => {
    event.preventDefault()
    setNotice('')
    setError('')
    try {
      const data = await apiFetch('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({ scheduleId, trainingMode, notes }),
      })
      setReservations((prev) => [data.reservation, ...prev])
      setNotes('')
      setNotice('Reservation saved to database!')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCancel = async (id) => {
    try {
      await apiFetch(`/api/reservations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Cancelled' }),
      })
      setReservations((prev) => prev.map((r) => (r._id === id ? { ...r, status: 'Cancelled' } : r)))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="module-container">
      <h1>Online Plotting &amp; Reservation</h1>
      <p className="portal-subtitle">Reserve your slot in an active training schedule.</p>

      {notice && <p className="portal-notice" role="status">{notice}</p>}
      {error && <p className="portal-notice portal-notice-error" role="alert">{error}</p>}

      <form className="portal-form" onSubmit={handleReserve}>
        <div className="portal-form-grid">
          <div className="portal-field">
            <label htmlFor="res-schedule">Select Plotted Schedule</label>
            <select id="res-schedule" value={scheduleId} onChange={(e) => setScheduleId(e.target.value)} required>
              {schedules.length === 0 && <option value="">No schedules available</option>}
              {schedules.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.course?.title} — {s.date} ({s.slot}) [{s.openSlots} left]
                </option>
              ))}
            </select>
          </div>
          <div className="portal-field">
            <label htmlFor="res-mode">Training Mode</label>
            <select id="res-mode" value={trainingMode} onChange={(e) => setTrainingMode(e.target.value)}>
              <option>Office Training</option>
              <option>Virtual Training</option>
              <option>Group Training</option>
              <option>1-to-1 Training</option>
            </select>
          </div>
          <div className="portal-field">
            <label htmlFor="res-notes">Notes (Optional)</label>
            <input id="res-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requirements" />
          </div>
        </div>
        <div className="portal-form-actions">
          <button type="submit" className="portal-btn" disabled={!scheduleId}>Submit Reservation</button>
        </div>
      </form>

      <h2 className="portal-section-title">My Reservations</h2>
      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Course &amp; Schedule</th>
              <th>Venue</th>
              <th>Mode</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr><td colSpan={5}>No reservations yet.</td></tr>
            ) : reservations.map((r) => (
              <tr key={r._id}>
                <td><strong>{r.schedule?.course?.title}</strong> — {r.schedule?.date} ({r.schedule?.slot})</td>
                <td>{r.schedule?.venue?.name}</td>
                <td>{r.trainingMode}</td>
                <td>
                  <span className={`portal-badge ${r.status === 'Confirmed' ? 'portal-badge-success' : r.status === 'Pending' ? 'portal-badge-warning' : 'portal-badge-neutral'}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  {r.status !== 'Cancelled' && (
                    <button type="button" className="portal-btn portal-btn-sm portal-btn-danger" onClick={() => handleCancel(r._id)}>
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