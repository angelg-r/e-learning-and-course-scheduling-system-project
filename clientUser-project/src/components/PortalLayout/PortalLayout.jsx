import './PortalLayout.css'
import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../../context/authUtils'

function PortalLayout({ roleLabel, portalTitle, base, navItems }) {
    const { user } = useAuth()

    return (
        <div className="portal-shell">
            <aside className="portal-sidebar" aria-label={`${roleLabel} navigation`}>
                <span className="portal-role-badge">{roleLabel}</span>
                <h2 className="portal-sidebar-title">{portalTitle}</h2>
                {user?.fullName && (
                    <p className="portal-user-meta">
                        Signed in as <strong>{user.fullName}</strong>
                    </p>
                )}

                <nav className="portal-nav">
                    {navItems.map(({ path, label }) => (
                        <NavLink key={path} to={`/${base}/${path}`}>
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <div className="portal-main">
                <Outlet />
            </div>
        </div>
    )
}

export default PortalLayout