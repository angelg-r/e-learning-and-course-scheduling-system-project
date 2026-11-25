import { useState } from 'react'
import { AuthContext } from './authUtils'

const STORAGE_KEY = 'grti_user'
const TOKEN_KEY = 'grti_token'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            return saved ? JSON.parse(saved) : null
        } catch {
            return null
        }
    })

    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)

    const loginUser = (userData, authToken) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
        if (authToken) {
            localStorage.setItem(TOKEN_KEY, authToken)
            setToken(authToken)
        }
        setUser(userData)
    }

    const logoutUser = () => {
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    )
}