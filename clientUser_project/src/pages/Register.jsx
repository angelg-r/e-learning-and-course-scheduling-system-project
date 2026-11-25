
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import './Register.css'

function Register() {
    const [notice, setNotice] = useState('')
    const [loading, setLoading] = useState(false)
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

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
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
            setNotice(error.message || 'Unable to connect to the server.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="register-page" aria-labelledby="register-heading">
            <h2 id="register-heading">Create an account</h2>

            <form className="register-form" onSubmit={handleSubmit}>
                <label htmlFor="register-name">Full Name</label>
                <input
                    id="register-name"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                />

                <label htmlFor="register-email">Email</label>
                <input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                />

                <label htmlFor="register-password">Password</label>
                <input
                    id="register-password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : 'Sign Up'}
                </button>
            </form>

            <p className="register-notice" role="status">
                {notice}
            </p>

            <p className="register-login-link">
                Already have an account?{' '}
                <Link to="/goodrespondertraininginstitute/login">
                    Log In
                </Link>
            </p>
        </section>
    )
}

export default Register
