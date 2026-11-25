import { Navigate, Outlet } from 'react-router'
import { getPortalPath, normalizeRole, useAuth } from '../../context/authUtils'

function ProtectedRoute({ allowedRoles }) {
    const { user } = useAuth()

    if (!user) {
        return <Navigate to="/goodrespondertraininginstitute/login" replace />
    }

    const role = normalizeRole(user.role)
    if (!allowedRoles.includes(role)) {
        return <Navigate to={getPortalPath(role)} replace />
    }

    return <Outlet />
}

export default ProtectedRoute