import { useState } from 'react'
import { useNavigate } from 'react-router'
import { getPortalPath, useAuth } from '../context/authUtils'
import { API_URL } from '../config/api'
import './Login.css'

function Login() {
    const [notice, setNotice] = useState('')
    const [loading, setLoading] = useState(false)
    const { loginUser } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const email = formData.get('email')
        const password = formData.get('password')

        setLoading(true)
        setNotice('')

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Login failed. Please check your details.')
            }

            loginUser(data.user, data.token)
            navigate(getPortalPath(data.user?.role))
        } catch (error) {
            setNotice(error.message || 'Unable to connect to the server.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="login-page" aria-labelledby="login-heading">
            <p className="login-eyebrow">Good Responder Training Institute</p>
            <h2 id="login-heading">Log In</h2>
            <p className="login-intro">Use your account details to continue.</p>

            <form className="login-form" onSubmit={handleSubmit}>
                <label htmlFor="login-email">Email</label>
                <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                />

                <label htmlFor="login-password">Password</label>
                <input
                    id="login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Log in'}
                </button>
            </form>

            <p className="login-notice" role="status">
                {notice}
            </p>
        </section>
    )
}

export default Login