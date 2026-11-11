import './NavigationBar.css'
import { useState } from 'react'
import { NavLink } from 'react-router'

function NavigationBar() {
  const [selectedTrainingMode, setSelectedTrainingMode] = useState('')
  const trainingModes = ['Office Training', 'Virtual Training', 'Group Training', '1-to-1 Training']

  return (
    <nav className="site-nav" aria-label="Main navigation">
      <NavLink className="nav-dropdown" to="/goodrespondertraininginstitute/home">
        All Courses
        <span className="dropdown-icon" aria-hidden="true" />
      </NavLink>
      <form className="nav-search" role="search" onSubmit={(event) => event.preventDefault()}>
        <input type="search" aria-label="Search courses" placeholder="What do you want to master today?" />
      </form>
      <details className="training-modes-menu">
        <summary className="nav-dropdown nav-label">
          Training Modes
          <span className="dropdown-icon" aria-hidden="true" />
        </summary>
        <ul className="training-mode-options">
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
    </nav>
  )
}

export default NavigationBar
