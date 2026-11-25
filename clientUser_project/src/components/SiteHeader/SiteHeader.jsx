import './SiteHeader.css'
import NavigationBar from '../NavigationBar/NavigationBar'
import { NavLink } from 'react-router'

function SiteHeader() {
    return (
        <header className="site-header">
            <h1>
                <NavLink to="/goodrespondertraininginstitute/home">
                    Good Responder Training Institute
                </NavLink>
            </h1>
            <NavigationBar />
        </header>
    )
}

export default SiteHeader