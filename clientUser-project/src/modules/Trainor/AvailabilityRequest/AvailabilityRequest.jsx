import { useEffect, useState } from 'react'
import { apiFetch } from '../../../config/api'

export default function AvailabilityRequest() {
  const [requests, setRequests] = useState([])
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('09:00 AM - 12:00 PM')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiFetch('/api/availability')
      .then((data) => { if (active) setRequests(data.requests || []) })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const data = await apiFetch('/api/availability', {
        method: 'POST',
        body: JSON.stringify({ date, slot, reason }),
      })
      setRequests((prev) => [data.request, ...prev])
      setDate('')
      setReason('')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/availability/${id}`, { method: 'DELETE' })
      setRequests((prev) => prev.filter((item) => item._id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="module-container">
      <h1>Availability &amp; Schedule Request</h1>
      <p className="portal-subtitle">Submit unavailable dates so Admins avoid slotting conflicts.</p>
      {error && <p className="portal-notice portal-notice-error">{error}</p>}

      <form className="portal-form" onSubmit={handleSubmit}>
        <div className="portal-form-grid">
          <div className="portal-field">
            <label htmlFor="avail-date">Unavailable Date</label>
            <input id="avail-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="portal-field">
            <label htmlFor="avail-slot">Time Window</label>
            <select id="avail-slot" value={slot} onChange={(e) => setSlot(e.target.value)}>
              <option>09:00 AM - 12:00 PM</option>
              <option>01:00 PM - 04:00 PM</option>
              <option>Full Day</option>
            </select>
          </div>
          <div className="portal-field">
            <label htmlFor="avail-reason">Reason</label>
            <input id="avail-reason" value={reason} onChange={(e) => setReason(e.target.value)} required />
          </div>
        </div>
        <div className="portal-form-actions">
          <button type="submit" className="portal-btn">Submit Request</button>
        </div>
      </form>

      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time Window</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan={5}>No availability requests yet.</td></tr>
            ) : requests.map((r) => (
              <tr key={r._id}>
                <td>{r.date}</td>
                <td>{r.slot}</td>
                <td>{r.reason}</td>
                <td><span className="portal-badge portal-badge-warning">{r.status}</span></td>
                <td>
                  <button type="button" className="portal-btn portal-btn-sm portal-btn-danger" onClick={() => handleDelete(r._id)}>
                    Delete
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