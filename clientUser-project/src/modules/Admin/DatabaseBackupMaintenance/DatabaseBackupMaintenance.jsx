import { useState } from 'react'
import { apiFetch } from '../../../config/api'

export default function DatabaseBackupMaintenance() {
  const [logs, setLogs] = useState([])
  const [error, setError] = useState('')

  const handleExport = async () => {
    setError('')
    try {
      const [users, courses, venues, schedules, reservations] = await Promise.all([
        apiFetch('/api/users'),
        apiFetch('/api/courses'),
        apiFetch('/api/venues'),
        apiFetch('/api/schedules'),
        apiFetch('/api/reservations'),
      ])
      const payload = {
        exportedAt: new Date().toISOString(),
        users: users.users,
        courses: courses.courses,
        venues: venues.venues,
        schedules: schedules.schedules,
        reservations: reservations.reservations,
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `grti-mongodb-backup-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)

      setLogs((prev) => [
        { id: Date.now(), date: new Date().toLocaleString(), type: 'Full MongoDB JSON Export', status: 'Completed' },
        ...prev,
      ])
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="module-container">
      <h1>Database Backup &amp; Maintenance</h1>
      <p className="portal-subtitle">Export a full snapshot of your MongoDB collections.</p>
      {error && <p className="portal-notice portal-notice-error">{error}</p>}

      <div className="portal-toolbar">
        <button type="button" className="portal-btn" onClick={handleExport}>
          Export MongoDB JSON Backup
        </button>
      </div>

      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Operation</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={3}>No exports run in this session yet.</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id}>
                <td>{log.date}</td>
                <td>{log.type}</td>
                <td><span className="portal-badge portal-badge-success">{log.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}