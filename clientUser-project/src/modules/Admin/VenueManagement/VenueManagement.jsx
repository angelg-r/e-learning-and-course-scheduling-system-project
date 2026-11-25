import { useEffect, useState } from 'react'
import { apiFetch } from '../../../config/api'

export default function VenueManagement() {
  const [venues, setVenues] = useState([])
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [capacity, setCapacity] = useState(20)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiFetch('/api/venues')
      .then((data) => { if (active) setVenues(data.venues || []) })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  const handleAdd = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const data = await apiFetch('/api/venues', {
        method: 'POST',
        body: JSON.stringify({ name, location, capacity: Number(capacity) }),
      })
      setVenues((prev) => [data.venue, ...prev])
      setName('')
      setLocation('')
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleStatus = async (id) => {
    try {
      const data = await apiFetch(`/api/venues/${id}/status`, { method: 'PATCH' })
      setVenues((prev) => prev.map((v) => (v._id === id ? data.venue : v)))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/venues/${id}`, { method: 'DELETE' })
      setVenues((prev) => prev.filter((item) => item._id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="module-container">
      <h1>Venue Management</h1>
      <p className="portal-subtitle">Register physical training rooms and virtual classrooms.</p>
      {error && <p className="portal-notice portal-notice-error">{error}</p>}

      <form className="portal-form" onSubmit={handleAdd}>
        <div className="portal-form-grid">
          <div className="portal-field">
            <label htmlFor="venue-name">Venue / Room Name</label>
            <input id="venue-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="portal-field">
            <label htmlFor="venue-loc">Location / Link Type</label>
            <input id="venue-loc" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>
          <div className="portal-field">
            <label htmlFor="venue-cap">Capacity</label>
            <input id="venue-cap" type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
          </div>
        </div>
        <div className="portal-form-actions">
          <button type="submit" className="portal-btn">Add Venue</button>
        </div>
      </form>

      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Venue</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {venues.length === 0 ? (
              <tr><td colSpan={5}>No venues added yet.</td></tr>
            ) : venues.map((v) => (
              <tr key={v._id}>
                <td><strong>{v.name}</strong></td>
                <td>{v.location}</td>
                <td>{v.capacity}</td>
                <td>
                  <span className={`portal-badge ${v.status === 'Available' ? 'portal-badge-success' : 'portal-badge-warning'}`}>
                    {v.status}
                  </span>
                </td>
                <td className="portal-actions-cell">
                  <button type="button" className="portal-btn portal-btn-sm portal-btn-secondary" onClick={() => toggleStatus(v._id)}>
                    Toggle Status
                  </button>
                  <button type="button" className="portal-btn portal-btn-sm portal-btn-danger" onClick={() => handleDelete(v._id)}>
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