import './NavigationBar.css'
import { NavLink } from 'react-router'

function NavigationBar() {
  return (
    <nav className="site-nav" aria-label="Main navigation">
      <NavLink to="goodrespondertraininginstitute/home">Home</NavLink>
      <NavLink to="goodrespondertraininginstitute/about">About</NavLink>
      <NavLink to="goodrespondertraininginstitute/contact">Contact</NavLink>
    </nav>
  )
}

export default NavigationBar
