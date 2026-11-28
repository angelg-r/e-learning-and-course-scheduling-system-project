import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../../config/api'
import './InteractiveSchedulePlotter.css'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toIsoDate(year, monthIndex, day) {
  const mm = String(monthIndex + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

export default function InteractiveSchedulePlotter() {
  const [courses, setCourses] = useState([])
  const [trainors, setTrainors] = useState([])
  const [venues, setVenues] = useState([])
  const [schedules, setSchedules] = useState([])
  const [availability, setAvailability] = useState([])

  const [course, setCourse] = useState('')
  const [trainor, setTrainor] = useState('')
  const [venue, setVenue] = useState('')
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('09:00 AM - 12:00 PM')
  const [maxSlots, setMaxSlots] = useState(15)

  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      apiFetch('/api/courses'),
      apiFetch('/api/users/trainors'),
      apiFetch('/api/venues'),
      apiFetch('/api/schedules'),
      apiFetch('/api/availability'),
    ])
      .then(([cRes, tRes, vRes, sRes, aRes]) => {
        if (!active) return
        const cList = cRes.courses || []
        const tList = tRes.trainors || []
        const vList = (vRes.venues || []).filter((v) => v.status !== 'Maintenance')
        setCourses(cList)
        setTrainors(tList)
        setVenues(vList)
        setSchedules(sRes.schedules || [])
        setAvailability(aRes.requests || [])

        if (cList.length > 0) setCourse(cList[0]._id)
        if (tList.length > 0) setTrainor(tList[0]._id)
        if (vList.length > 0) setVenue(vList[0]._id)
      })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  const trainorRequestsByDate = useMemo(() => {
    const map = new Map()
    for (const reqItem of availability) {
      if (String(reqItem.trainor?._id || reqItem.trainor) !== trainor) continue
      if (reqItem.status === 'Declined') continue
      const existing = map.get(reqItem.date) || []
      existing.push(reqItem)
      map.set(reqItem.date, existing)
    }
    return map
  }, [availability, trainor])

  const selectedDateRequests = date ? (trainorRequestsByDate.get(date) || []) : []
  const isSelectedBlocked = selectedDateRequests.some(
    (r) => r.status === 'Approved' && (r.slot === 'Full Day' || r.slot === slot)
  )

  const handlePlot = async (event) => {
    event.preventDefault()
    setNotice('')
    setError('')
    if (isSelectedBlocked) {
      setError('Cannot plot on this date/slot because the selected trainor has an approved unavailability.')
      return
    }
    try {
      const data = await apiFetch('/api/schedules', {
        method: 'POST',
        body: JSON.stringify({ course, trainor, venue, date, slot, maxSlots: Number(maxSlots) }),
      })
      setSchedules((prev) => [...prev, data.schedule])
      setDate('')
      setNotice('Schedule plotted and trainor notified!')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    setNotice('')
    setError('')
    try {
      await apiFetch(`/api/schedules/${id}`, { method: 'DELETE' })
      setSchedules((prev) => prev.filter((s) => s._id !== id))
      setNotice('Schedule removed.')
    } catch (err) {
      setError(err.message)
    }
  }

  const year = viewMonth.getFullYear()
  const monthIndex = viewMonth.getMonth()
  const firstDayOffset = new Date(year, monthIndex, 1).getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const monthLabel = viewMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const calendarCells = []
  for (let i = 0; i < firstDayOffset; i += 1) {
    calendarCells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    calendarCells.push(d)
  }

  return (
    <section className="module-container">
      <h1>Interactive Schedule Plotter</h1>
      <p className="portal-subtitle">
        Plot training schedules with automatic conflict detection. Approved trainor unavailability dates are marked in red.
      </p>

      {notice && <p className="portal-notice" role="status">{notice}</p>}
      {error && <p className="portal-notice portal-notice-error" role="alert">{error}</p>}

      <form className="portal-form" onSubmit={handlePlot}>
        <div className="portal-form-grid">
          <div className="portal-field">
            <label htmlFor="plot-course">Course</label>
            <select id="plot-course" value={course} onChange={(e) => setCourse(e.target.value)} required>
              {courses.length === 0 && <option value="">No courses found (add in Courses &amp; Content)</option>}
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.code} — {c.title}</option>
              ))}
            </select>
          </div>
          <div className="portal-field">
            <label htmlFor="plot-trainor">Trainor</label>
            <select
              id="plot-trainor"
              value={trainor}
              onChange={(e) => {
                setTrainor(e.target.value)
                setError('')
              }}
              required
            >
              {trainors.length === 0 && <option value="">No trainors found (create in Users &amp; Instructors)</option>}
              {trainors.map((t) => (
                <option key={t._id} value={t._id}>{t.fullName}</option>
              ))}
            </select>
          </div>
          <div className="portal-field">
            <label htmlFor="plot-venue">Venue</label>
            <select id="plot-venue" value={venue} onChange={(e) => setVenue(e.target.value)} required>
              {venues.length === 0 && <option value="">No available venues (add in Venue Management)</option>}
              {venues.map((v) => (
                <option key={v._id} value={v._id}>{v.name} (Cap: {v.capacity})</option>
              ))}
            </select>
          </div>
          <div className="portal-field">
            <label htmlFor="plot-date">Selected Date</label>
            <input
              id="plot-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value)
                setError('')
              }}
              required
            />
          </div>
          <div className="portal-field">
            <label htmlFor="plot-slot">Time Slot</label>
            <select id="plot-slot" value={slot} onChange={(e) => setSlot(e.target.value)}>
              <option>09:00 AM - 12:00 PM</option>
              <option>01:00 PM - 04:00 PM</option>
              <option>08:00 AM - 05:00 PM</option>
            </select>
          </div>
          <div className="portal-field">
            <label htmlFor="plot-max">Max Slots</label>
            <input id="plot-max" type="number" min="1" value={maxSlots} onChange={(e) => setMaxSlots(e.target.value)} required />
          </div>
        </div>

        <div className="plotter-calendar-card">
          <div className="plotter-calendar-header">
            <button
              type="button"
              className="portal-btn portal-btn-sm portal-btn-secondary"
              onClick={() => setViewMonth(new Date(year, monthIndex - 1, 1))}
            >
              &larr; Prev
            </button>
            <h2 className="plotter-calendar-title">{monthLabel}</h2>
            <button
              type="button"
              className="portal-btn portal-btn-sm portal-btn-secondary"
              onClick={() => setViewMonth(new Date(year, monthIndex + 1, 1))}
            >
              Next &rarr;
            </button>
          </div>

          <div className="plotter-calendar-grid">
            {WEEKDAYS.map((dayName) => (
              <div key={dayName} className="plotter-calendar-weekday">{dayName}</div>
            ))}
            {calendarCells.map((dayNum, idx) => {
              if (!dayNum) {
                return <div key={`empty-${idx}`} className="plotter-calendar-day is-empty" />
              }
              const iso = toIsoDate(year, monthIndex, dayNum)
              const reqs = trainorRequestsByDate.get(iso) || []
              const hasApproved = reqs.some((r) => r.status === 'Approved')
              const isBlockedForSlot = reqs.some(
                (r) => r.status === 'Approved' && (r.slot === 'Full Day' || r.slot === slot)
              )
              const hasPending = !hasApproved && reqs.some((r) => r.status === 'Pending')
              const isSelected = date === iso

              const stateClass = hasApproved
                ? 'is-unavailable'
                : isSelected
                  ? 'is-selected'
                  : hasPending
                    ? 'is-pending'
                    : ''

              const tooltip = reqs.length
                ? reqs.map((r) => `${r.status}: ${r.slot} (${r.reason})`).join(' | ')
                : 'Available'

              return (
                <button
                  key={iso}
                  type="button"
                  title={tooltip}
                  disabled={isBlockedForSlot}
                  className={`plotter-calendar-day ${stateClass}`}
                  onClick={() => {
                    setDate(iso)
                    setError('')
                  }}
                >
                  <span>{dayNum}</span>
                  {hasApproved && <span className="plotter-calendar-tag">Unavail</span>}
                  {hasPending && <span className="plotter-calendar-tag">Pending</span>}
                </button>
              )
            })}
          </div>

          <div className="plotter-calendar-legend">
            <span className="plotter-legend-item">
              <span className="plotter-legend-dot plotter-legend-red" />
              Approved Unavailability (Red / Blocked)
            </span>
            <span className="plotter-legend-item">
              <span className="plotter-legend-dot plotter-legend-amber" />
              Pending Request
            </span>
            <span className="plotter-legend-item">
              <span className="plotter-legend-dot plotter-legend-selected" />
              Selected Date
            </span>
          </div>
        </div>

        <div className="portal-form-actions">
          <button
            type="submit"
            className="portal-btn"
            disabled={!course || !trainor || !venue || !date || isSelectedBlocked}
          >
            Plot Schedule
          </button>
        </div>
      </form>

      <h2 className="portal-section-title">Plotted Schedules</h2>
      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Trainor</th>
              <th>Venue</th>
              <th>Date &amp; Slot</th>
              <th>Slots</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr><td colSpan={6}>No schedules plotted yet.</td></tr>
            ) : schedules.map((s) => (
              <tr key={s._id}>
                <td><strong>{s.course?.title || 'Course'}</strong></td>
                <td>{s.trainor?.fullName || 'Trainor'}</td>
                <td>{s.venue?.name || 'Venue'}</td>
                <td>{s.date} ({s.slot})</td>
                <td>{s.reservedCount || 0} / {s.maxSlots}</td>
                <td>
                  <button type="button" className="portal-btn portal-btn-sm portal-btn-danger" onClick={() => handleDelete(s._id)}>
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
