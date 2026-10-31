import './NavigationBar.css'
import { NavLink } from 'react-router'

function NavigationBar() {
  return (
    <nav className="site-nav" aria-label="Main navigation">
      <NavLink to="/home">Home</NavLink>
      <NavLink to="/about">About</NavLink>
      <NavLink to="/contact">Contact</NavLink>
    </nav>
  )
}

export default NavigationBar
