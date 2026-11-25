import { useState } from 'react'
import { NavLink } from 'react-router'
import NavigationBar from '../NavigationBar/NavigationBar'
import grtiLogo from '../../assets/grti-logo.jpg'
import './SiteHeader.css'

function SiteHeader() {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <header className="site-header">
            <div className="site-header-inner">
                <div className="site-brand-row">
                    <NavLink
                        to="/goodrespondertraininginstitute/home"
                        className="site-brand"
                        aria-label="Good Responder Training Institute Home"
                        onClick={() => setMobileOpen(false)}
                    >
                        <img
                            src={grtiLogo}
                            alt="Good Responder Training Institute"
                            className="site-brand-logo"
                        />
                    </NavLink>

                    <button
                        type="button"
                        className="mobile-menu-toggle"
                        aria-label="Toggle navigation menu"
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen((prev) => !prev)}
                    >
                        <span className="hamburger-lines" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                        </span>
                    </button>
                </div>

                <NavigationBar mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
            </div>
        </header>
    )
}

export default SiteHeader