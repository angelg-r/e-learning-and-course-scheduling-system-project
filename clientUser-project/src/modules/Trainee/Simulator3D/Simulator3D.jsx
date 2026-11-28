import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { apiFetch } from '../../../config/api'
import './Simulator3D.css'

const SCENARIO_STEPS = [
  { id: 'scene', title: '1. Scene Size-Up & Safety', desc: 'Inspect surroundings in 3D view and confirm responder PPE.' },
  { id: 'assess', title: '2. Primary Assessment', desc: 'Check responsiveness, airway, and breathing zone.' },
  { id: 'action', title: '3. Hands-On Intervention', desc: 'Execute targeted responder procedure on the 3D model.' },
  { id: 'stabilize', title: '4. Stabilize & Monitor', desc: 'Verify vital posture and prepare handover.' },
]

// 3D wireframe + shaded responder training mannequin geometry (normalized coordinates)
const BOX_VERTICES = [
  [-0.9, -0.35, -0.45], [0.9, -0.35, -0.45], [0.9, 0.35, -0.45], [-0.9, 0.35, -0.45],
  [-0.9, -0.35, 0.45], [0.9, -0.35, 0.45], [0.9, 0.35, 0.45], [-0.9, 0.35, 0.45],
]
const BOX_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
]

const HEAD_VERTICES = [
  [-1.45, -0.24, -0.24], [-1.0, -0.24, -0.24], [-1.0, 0.24, -0.24], [-1.45, 0.24, -0.24],
  [-1.45, -0.24, 0.24], [-1.0, -0.24, 0.24], [-1.0, 0.24, 0.24], [-1.45, 0.24, 0.24],
]

function projectPoint([x, y, z], rotX, rotY, zoom, width, height) {
  const cosY = Math.cos(rotY)
  const sinY = Math.sin(rotY)
  const x1 = x * cosY - z * sinY
  const z1 = x * sinY + z * cosY

  const cosX = Math.cos(rotX)
  const sinX = Math.sin(rotX)
  const y2 = y * cosX - z1 * sinX
  const z2 = y * sinX + z1 * cosX

  const distance = 4.2
  const scale = (zoom * Math.min(width, height) * 0.48) / (distance + z2)
  return [width / 2 + x1 * scale, height / 2 + y2 * scale, z2]
}

export default function Simulator3D() {
  const { courseId: routeCourseId } = useParams()
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState(routeCourseId || '')
  const [completedSteps, setCompletedSteps] = useState([])
  const [autoRotate, setAutoRotate] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [error, setError] = useState('')

  const canvasRef = useRef(null)
  const rotationRef = useRef({ x: 0.45, y: 0.65 })
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 })

  useEffect(() => {
    let active = true
    apiFetch('/api/courses')
      .then((data) => {
        if (!active) return
        const list = data.courses || []
        setCourses(list)
        if (!routeCourseId && list.length > 0) {
          setSelectedCourseId((prev) => prev || list[0]._id)
        }
      })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [routeCourseId])

  const activeCourse = courses.find((c) => c._id === selectedCourseId) || courses[0] || null

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    let frameId = 0
    let pulse = 0

    const drawShape = (verts, stroke, fill, rotX, rotY, width, height) => {
      const pts = verts.map((v) => projectPoint(v, rotX, rotY, zoom, width, height))
      ctx.beginPath()
      for (const [a, b] of BOX_EDGES) {
        ctx.moveTo(pts[a][0], pts[a][1])
        ctx.lineTo(pts[b][0], pts[b][1])
      }
      if (fill) {
        ctx.fillStyle = fill
        ctx.fill()
      }
      ctx.strokeStyle = stroke
      ctx.lineWidth = 2
      ctx.stroke()
    }

    const render = () => {
      if (autoRotate && !dragRef.current.active) {
        rotationRef.current.y += 0.008
      }
      pulse += 0.06
      const width = canvas.width
      const height = canvas.height
      ctx.clearRect(0, 0, width, height)

      // Subtle 3D floor grid
      const { x: rotX, y: rotY } = rotationRef.current
      ctx.strokeStyle = 'rgba(223, 211, 165, 0.16)'
      ctx.lineWidth = 1
      for (let g = -2; g <= 2; g += 0.5) {
        const p1 = projectPoint([g, 0.65, -2], rotX, rotY, zoom, width, height)
        const p2 = projectPoint([g, 0.65, 2], rotX, rotY, zoom, width, height)
        ctx.beginPath()
        ctx.moveTo(p1[0], p1[1])
        ctx.lineTo(p2[0], p2[1])
        ctx.stroke()

        const q1 = projectPoint([-2, 0.65, g], rotX, rotY, zoom, width, height)
        const q2 = projectPoint([2, 0.65, g], rotX, rotY, zoom, width, height)
        ctx.beginPath()
        ctx.moveTo(q1[0], q1[1])
        ctx.lineTo(q2[0], q2[1])
        ctx.stroke()
      }

      // Draw 3D training torso & head
      drawShape(BOX_VERTICES, '#FDF6E4', 'rgba(157, 163, 96, 0.25)', rotX, rotY, width, height)
      drawShape(HEAD_VERTICES, '#DFD3A5', 'rgba(223, 211, 165, 0.22)', rotX, rotY, width, height)

      // Target compression / assessment beacon in 3D space
      const beacon = projectPoint([-0.1, -0.38, 0], rotX, rotY, zoom, width, height)
      const radius = 8 + Math.sin(pulse) * 3
      ctx.beginPath()
      ctx.arc(beacon[0], beacon[1], radius, 0, Math.PI * 2)
      ctx.fillStyle = completedSteps.includes('action') ? 'rgba(157, 163, 96, 0.85)' : 'rgba(220, 38, 38, 0.8)'
      ctx.fill()
      ctx.strokeStyle = '#FDF6E4'
      ctx.lineWidth = 2
      ctx.stroke()

      frameId = requestAnimationFrame(render)
    }

    frameId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(frameId)
  }, [autoRotate, zoom, completedSteps])

  const handlePointerDown = (e) => {
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY }
  }

  const handlePointerMove = (e) => {
    if (!dragRef.current.active) return
    const dx = e.clientX - dragRef.current.lastX
    const dy = e.clientY - dragRef.current.lastY
    dragRef.current.lastX = e.clientX
    dragRef.current.lastY = e.clientY
    rotationRef.current.y += dx * 0.01
    rotationRef.current.x = Math.max(-1.2, Math.min(1.2, rotationRef.current.x + dy * 0.01))
  }

  const handlePointerUp = () => {
    dragRef.current.active = false
  }

  const toggleStep = (id) => {
    setCompletedSteps((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const progressPct = Math.round((completedSteps.length / SCENARIO_STEPS.length) * 100)

  return (
    <section className="module-container">
      <h1>3D Course Training Simulator</h1>
      <p className="portal-subtitle">
        Interactive 3D simulation workspace for practicing course procedures before hands-on assessment.
      </p>
      {error && <p className="portal-notice portal-notice-error">{error}</p>}

      <div className="portal-toolbar">
        <select
          aria-label="Select course for 3D simulator"
          value={activeCourse?._id || ''}
          onChange={(e) => {
            setSelectedCourseId(e.target.value)
            setCompletedSteps([])
          }}
        >
          {courses.length === 0 && <option value="">No courses available</option>}
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.code} — {c.title}</option>
          ))}
        </select>

        <Link to="/goodrespondertraininginstitute/trainee/portal" className="portal-btn portal-btn-sm portal-btn-secondary">
          &larr; Back to E-Learning Portal
        </Link>
      </div>

      <div className="sim3d-layout">
        <div className="sim3d-viewport-card">
          <div className="sim3d-viewport-bar">
            <span className="sim3d-viewport-title">
              {activeCourse ? `${activeCourse.code}: ${activeCourse.title}` : '3D Responder Scene'}
            </span>
            <div className="sim3d-controls">
              <button type="button" className="portal-btn portal-btn-sm portal-btn-secondary" onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}>
                Zoom +
              </button>
              <button type="button" className="portal-btn portal-btn-sm portal-btn-secondary" onClick={() => setZoom((z) => Math.max(0.65, z - 0.15))}>
                Zoom -
              </button>
              <button type="button" className="portal-btn portal-btn-sm portal-btn-secondary" onClick={() => setAutoRotate((v) => !v)}>
                {autoRotate ? 'Pause Spin' : 'Auto Spin'}
              </button>
              <button
                type="button"
                className="portal-btn portal-btn-sm portal-btn-secondary"
                onClick={() => {
                  rotationRef.current = { x: 0.45, y: 0.65 }
                  setZoom(1)
                }}
              >
                Reset View
              </button>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="sim3d-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />

          <p className="sim3d-viewport-hint">
            Drag inside the 3D viewport to rotate 360&deg;. Target beacon turns green once Step 3 is practiced.
          </p>
        </div>

        <div className="sim3d-steps-card">
          <h2>Simulation Checklist ({progressPct}%)</h2>
          <ul className="sim3d-step-list">
            {SCENARIO_STEPS.map((step) => {
              const done = completedSteps.includes(step.id)
              return (
                <li key={step.id} className={`sim3d-step-item ${done ? 'is-done' : ''}`}>
                  <div className="sim3d-step-header">
                    <span>{step.title}</span>
                    <button
                      type="button"
                      className={`portal-btn portal-btn-sm ${done ? '' : 'portal-btn-secondary'}`}
                      onClick={() => toggleStep(step.id)}
                    >
                      {done ? '✓ Done' : 'Practice'}
                    </button>
                  </div>
                  <p className="sim3d-step-desc">{step.desc}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
