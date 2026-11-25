import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { getPortalPath, normalizeRole, useAuth } from '../../context/authUtils'
import './NavigationBar.css'

const quickCourses = [
  { title: 'Basic Life Support (BLS)', mode: 'Office Training' },
  { title: 'First Aid & CPR', mode: 'Virtual Training' },
  { title: 'Disaster Preparedness', mode: 'Group Training' },
  { title: 'Emergency Triage', mode: '1-to-1 Training' },
]

const roleHeaderConfig = {
  guest: {
    showSearch: true,
    links: [
      { to: '/goodrespondertraininginstitute/home', label: 'Home' },
      { to: '/goodrespondertraininginstitute/contact', label: 'Contact Us' },
    ],
  },
  trainee: {
    showSearch: true,
    badgeLabel: 'Trainee',
    links: [
      { to: '/goodrespondertraininginstitute/trainee/dashboard', label: 'Dashboard' },
      { to: '/goodrespondertraininginstitute/trainee/portal', label: 'E-Learning' },
      { to: '/goodrespondertraininginstitute/trainee/schedules', label: 'Schedules' },
      { to: '/goodrespondertraininginstitute/trainee/reservations', label: 'Reservations' },
    ],
  },
  trainor: {
    showSearch: false,
    badgeLabel: 'Trainor',
    links: [
      { to: '/goodrespondertraininginstitute/trainor/schedule', label: 'My Schedule' },
      { to: '/goodrespondertraininginstitute/trainor/roster', label: 'Trainee Roster' },
      { to: '/goodrespondertraininginstitute/trainor/materials', label: 'Materials' },
      { to: '/goodrespondertraininginstitute/trainor/availability', label: 'Availability' },
    ],
  },
  admin: {
    showSearch: false,
    badgeLabel: 'Admin',
    links: [
      { to: '/goodrespondertraininginstitute/admin/dashboard', label: 'Dashboard' },
      { to: '/goodrespondertraininginstitute/admin/users', label: 'Users' },
      { to: '/goodrespondertraininginstitute/admin/courses', label: 'Courses' },
      { to: '/goodrespondertraininginstitute/admin/schedule-plotter', label: 'Schedule Plotter' },
      { to: '/goodrespondertraininginstitute/admin/reservations', label: 'Reservations' },
    ],
  },
}

function NavigationBar({ mobileOpen = false, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const navRef = useRef(null)
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  const activeRole = user ? normalizeRole(user.role) : 'guest'
  const config = roleHeaderConfig[activeRole] || roleHeaderConfig.guest

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setSearchFocused(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSearchFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const filteredCourses = quickCourses.filter((course) => {
    const q = searchQuery.trim().toLowerCase()
    return !q || course.title.toLowerCase().includes(q)
  })

  const closeAndNotify = () => {
    setSearchFocused(false)
    if (onNavigate) onNavigate()
  }

  const handleSelectCourse = () => {
    setSearchQuery('')
    closeAndNotify()
    navigate(
      user
        ? '/goodrespondertraininginstitute/trainee/portal'
        : '/goodrespondertraininginstitute/home'
    )
  }

  const handleLogout = () => {
    logoutUser()
    closeAndNotify()
    navigate('/goodrespondertraininginstitute/login')
  }

  const initials = (user?.fullName || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')

  return (
    <nav
      ref={navRef}
      className={`site-nav ${mobileOpen ? 'is-open' : ''}`}
      aria-label="Main navigation"
    >
      {/* Course Search (Shown for Guest & Trainee only) */}
      {config.showSearch && (
        <form
          className="nav-search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            if (filteredCourses.length > 0) handleSelectCourse()
          }}
        >
          <div className="nav-search-box">
            <input
              type="text"
              aria-label="Search courses"
              placeholder="Search courses..."
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setSearchFocused(true)
              }}
            />
            {searchQuery && (
              <button
                type="button"
                className="nav-search-clear"
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
              >
                &times;
              </button>
            )}
          </div>

          {searchFocused && searchQuery.trim() !== '' && (
            <ul className="nav-search-results">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <li key={course.title}>
                    <button type="button" onClick={handleSelectCourse}>
                      <span className="nav-search-course-title">{course.title}</span>
                      <span className="nav-search-course-mode">{course.mode}</span>
                    </button>
                  </li>
                ))
              ) : (
                <li className="nav-search-empty">No matching courses found.</li>
              )}
            </ul>
          )}
        </form>
      )}

      {/* Role-Specific Quick Links */}
      <div className="nav-links-group">
        {config.links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className="nav-text-link"
            onClick={closeAndNotify}
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* Auth Actions */}
      <div className="nav-auth-group">
        {user ? (
          <>
            <NavLink
              to={getPortalPath(user.role)}
              className={`nav-user-chip role-${activeRole}`}
              title={`Signed in as ${user.fullName}`}
              onClick={closeAndNotify}
            >
              <span className="nav-user-avatar">{initials}</span>
              <span>{config.badgeLabel}</span>
            </NavLink>
            <button
              type="button"
              className="nav-btn-outline"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/goodrespondertraininginstitute/login"
              className="nav-btn-outline"
              onClick={closeAndNotify}
            >
              Log In
            </NavLink>
            <NavLink
              to="/goodrespondertraininginstitute/register"
              className="nav-btn-primary"
              onClick={closeAndNotify}
            >
              Sign Up
            </NavLink>
          </>
        )}
      </div>
    </nav>
  )
}

export default NavigationBar