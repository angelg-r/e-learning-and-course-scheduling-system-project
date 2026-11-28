import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { API_URL } from '../config/api'
import './AuthPages.css'

function Register() {
    const [notice, setNotice] = useState('')
    const [isError, setIsError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault()

        const form = event.currentTarget
        const formData = new FormData(form)

        const fullName = formData.get('fullName')
        const email = formData.get('email')
        const password = formData.get('password')

        setLoading(true)
        setNotice('')
        setIsError(false)

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fullName, email, password })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed.')
            }

            setNotice('Account created successfully! Redirecting to Log In...')
            form.reset()

            setTimeout(() => {
                navigate('/goodrespondertraininginstitute/login')
            }, 1500)
        } catch (error) {
            setIsError(true)
            setNotice(error.message || 'Unable to connect to the server.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="auth-shell" aria-labelledby="register-heading">
            <div className="auth-card">
                <div className="auth-aside">
                    <div>
                        <span className="auth-aside-badge">Trainee Enrollment</span>
                        <h1 className="auth-aside-title">Start Your Certification Journey</h1>
                        <p className="auth-aside-copy">
                            Create your trainee account to browse medical and safety courses, study self-paced modules, and reserve your training dates online.
                        </p>
                    </div>
                    <ul className="auth-aside-features">
                        <li>BLS &amp; First Aid</li>
                        <li>Progress Tracking</li>
                        <li>Instant Reservations</li>
                    </ul>
                </div>

                <div className="auth-form-panel">
                    <p className="auth-eyebrow">New Trainee</p>
                    <h2 id="register-heading" className="auth-heading">Create an Account</h2>
                    <p className="auth-intro">Fill in your details below to register.</p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <label htmlFor="register-name">Full Name</label>
                            <input
                                id="register-name"
                                name="fullName"
                                type="text"
                                placeholder="Juan Dela Cruz"
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="register-email">Email Address</label>
                            <input
                                id="register-email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="register-password">Password (min. 8 characters)</label>
                            <div className="auth-input-wrap">
                                <input
                                    id="register-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a strong password"
                                    autoComplete="new-password"
                                    minLength={8}
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
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </form>

                    {notice && (
                        <p className={`auth-notice ${isError ? 'is-error' : ''}`} role="status">
                            {notice}
                        </p>
                    )}

                    <p className="auth-switch-link">
                        Already have an account?{' '}
                        <Link to="/goodrespondertraininginstitute/login">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Register
