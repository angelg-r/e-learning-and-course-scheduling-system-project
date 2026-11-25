import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

export const rolePortalMap = {
    admin: '/goodrespondertraininginstitute/admin/dashboard',
    trainor: '/goodrespondertraininginstitute/trainor/schedule',
    trainee: '/goodrespondertraininginstitute/trainee/dashboard',
    student: '/goodrespondertraininginstitute/trainee/dashboard',
}

export function normalizeRole(role) {
    const value = (role || '').toLowerCase()
    return value === 'student' ? 'trainee' : value
}

export function getPortalPath(role) {
    return rolePortalMap[(role || '').toLowerCase()] || rolePortalMap.trainee
}

export function useAuth() {
    return useContext(AuthContext)
}