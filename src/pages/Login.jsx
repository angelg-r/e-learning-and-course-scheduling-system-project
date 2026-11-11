import './Login.css'

function Login() {
    const handleSubmit = (event) => event.preventDefault()

    return (
        <section className="login-page" aria-labelledby="login-heading">
            <p className="login-eyebrow">Good Responder Training Institute</p>
            <h2 id="login-heading">Sign in</h2>
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
                <button type="submit">Sign in</button>
            </form>
            <p className="login-notice">Authentication is not connected yet.</p>
        </section>
    )
}

export default Login