import { useState } from 'react'
import { AuthContext } from './authUtils'

const STORAGE_KEY = 'grti_user'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            return saved ? JSON.parse(saved) : null
        } catch {
            return null
        }
    })

    const loginUser = (userData) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
        setUser(userData)
    }

    const logoutUser = () => {
        localStorage.removeItem(STORAGE_KEY)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    )
}