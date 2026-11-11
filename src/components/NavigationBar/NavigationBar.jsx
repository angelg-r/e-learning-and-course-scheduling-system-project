import './NavigationBar.css'
import { useState } from 'react'
import { NavLink } from 'react-router'

function NavigationBar() {
  const [selectedTrainingMode, setSelectedTrainingMode] = useState('')
  const trainingModes = ['Office Training', 'Virtual Training', 'Group Training', '1-to-1 Training']
  const openMenuOnMouseEnter = (event) => {
    if (event.pointerType === 'mouse') event.currentTarget.open = true
  }
  const closeMenuOnMouseLeave = (event) => {
    if (event.pointerType === 'mouse') event.currentTarget.open = false
  }

  return (
    <nav className="site-nav" aria-label="Main navigation">
      <details
        className="nav-dropdown-menu"
        onPointerEnter={openMenuOnMouseEnter}
        onPointerLeave={closeMenuOnMouseLeave}
      >
        <summary className="nav-dropdown nav-label">
          All Courses
          <span className="dropdown-icon" aria-hidden="true" />
        </summary>
        <ul className="dropdown-options">
          <li>
            <NavLink to="/goodrespondertraininginstitute/home">Browse all courses</NavLink>
          </li>
        </ul>
      </details>
      <form className="nav-search" role="search" onSubmit={(event) => event.preventDefault()}>
        <input type="search" aria-label="Search courses" placeholder="What do you want to master today?" />
      </form>
      <details
        className="nav-dropdown-menu"
        onPointerEnter={openMenuOnMouseEnter}
        onPointerLeave={closeMenuOnMouseLeave}
      >
        <summary className="nav-dropdown nav-label">
          Training Modes
          <span className="dropdown-icon" aria-hidden="true" />
        </summary>
        <ul className="dropdown-options">
          {trainingModes.map((mode) => (
            <li key={mode}>
              <button
                type="button"
                aria-pressed={selectedTrainingMode === mode}
                onClick={() => setSelectedTrainingMode(mode)}
              >
                {mode}
              </button>
            </li>
          ))}
        </ul>
      </details>
      <NavLink to="/goodrespondertraininginstitute/contact">Contact Us</NavLink>
      <NavLink className="nav-login" to="/goodrespondertraininginstitute/login">Login</NavLink>
    </nav>
  )
}

export default NavigationBar
