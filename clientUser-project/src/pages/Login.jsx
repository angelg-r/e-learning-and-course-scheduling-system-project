import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { getPortalPath, useAuth } from '../context/authUtils'
import { API_URL } from '../config/api'
import './AuthPages.css'

function Login() {
    const [notice, setNotice] = useState('')
    const [isError, setIsError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const { loginUser } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const email = formData.get('email')
        const password = formData.get('password')

        setLoading(true)
        setNotice('')
        setIsError(false)

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
            setIsError(true)
            setNotice(error.message || 'Unable to connect to the server.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="auth-shell" aria-labelledby="login-heading">
            <div className="auth-card">
                <div className="auth-aside">
                    <div>
                        <span className="auth-aside-badge">GRTI Training Portal</span>
                        <h1 className="auth-aside-title">Good Responder Training Institute</h1>
                        <p className="auth-aside-copy">
                            Access self-paced certification modules, view live training schedules, and manage your reservations in one place.
                        </p>
                    </div>
                    <ul className="auth-aside-features">
                        <li>Self-Paced E-Learning</li>
                        <li>Online Slot Reservation</li>
                        <li>SMS &amp; Email Updates</li>
                    </ul>
                </div>

                <div className="auth-form-panel">
                    <p className="auth-eyebrow">Portal Access</p>
                    <h2 id="login-heading" className="auth-heading">Welcome Back</h2>
                    <p className="auth-intro">Sign in with your trainee, trainor, or admin account.</p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <label htmlFor="login-email">Email Address</label>
                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="login-password">Password</label>
                            <div className="auth-input-wrap">
                                <input
                                    id="login-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="auth-pw-toggle"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>

                    {notice && (
                        <p className={`auth-notice ${isError ? 'is-error' : ''}`} role="status">
                            {notice}
                        </p>
                    )}

                    <p className="auth-switch-link">
                        New to GRTI?{' '}
                        <Link to="/goodrespondertraininginstitute/register">
                            Create a Trainee Account
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Login
