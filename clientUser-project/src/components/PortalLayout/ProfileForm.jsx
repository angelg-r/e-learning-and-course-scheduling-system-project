import { useEffect, useState } from 'react'
import { apiFetch } from '../../config/api'
import { useAuth } from '../../context/authUtils'

function ProfileForm({ title, showSpecialization = false }) {
    const { user, token, loginUser } = useAuth()
    const [fullName, setFullName] = useState(user?.fullName || '')
    const [email, setEmail] = useState(user?.email || '')
    const [phone, setPhone] = useState('')
    const [specialization, setSpecialization] = useState('')
    const [notice, setNotice] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true
        apiFetch('/api/users/me')
            .then((data) => {
                if (!active || !data.user) return
                setFullName(data.user.fullName || '')
                setEmail(data.user.email || '')
                setPhone(data.user.phone || '')
                setSpecialization(data.user.specialization || '')
            })
            .catch(() => { })
        return () => { active = false }
    }, [])

    const handleProfileSubmit = async (event) => {
        event.preventDefault()
        setNotice('')
        setError('')
        try {
            const data = await apiFetch('/api/users/me', {
                method: 'PUT',
                body: JSON.stringify({ fullName, phone, specialization }),
            })
            loginUser(data.user, token)
            setNotice('Profile saved to database!')
        } catch (err) {
            setError(err.message)
        }
    }

    const handlePasswordSubmit = async (event) => {
        event.preventDefault()
        setNotice('')
        setError('')
        const form = event.currentTarget
        const formData = new FormData(form)
        try {
            await apiFetch('/api/users/me', {
                method: 'PUT',
                body: JSON.stringify({
                    currentPassword: formData.get('currentPassword'),
                    newPassword: formData.get('newPassword'),
                }),
            })
            form.reset()
            setNotice('Password updated!')
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <section className="module-container">
            <h1>{title}</h1>
            <p className="portal-subtitle">Manage your personal details and account security.</p>

            {notice && <p className="portal-notice" role="status">{notice}</p>}
            {error && <p className="portal-notice portal-notice-error" role="alert">{error}</p>}

            <form className="portal-form" onSubmit={handleProfileSubmit}>
                <div className="portal-form-grid">
                    <div className="portal-field">
                        <label htmlFor="profile-name">Full Name</label>
                        <input id="profile-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                    <div className="portal-field">
                        <label htmlFor="profile-email">Email Address</label>
                        <input id="profile-email" type="email" value={email} disabled />
                    </div>
                    <div className="portal-field">
                        <label htmlFor="profile-phone">Contact Number</label>
                        <input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    {showSpecialization && (
                        <div className="portal-field">
                            <label htmlFor="profile-spec">Specialization</label>
                            <input id="profile-spec" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
                        </div>
                    )}
                </div>
                <div className="portal-form-actions">
                    <button type="submit" className="portal-btn">Save Profile</button>
                </div>
            </form>

            <h2 className="portal-section-title">Change Password</h2>
            <form className="portal-form" onSubmit={handlePasswordSubmit}>
                <div className="portal-form-grid">
                    <div className="portal-field">
                        <label htmlFor="curr-pass">Current Password</label>
                        <input id="curr-pass" name="currentPassword" type="password" required />
                    </div>
                    <div className="portal-field">
                        <label htmlFor="new-pass">New Password</label>
                        <input id="new-pass" name="newPassword" type="password" minLength={8} required />
                    </div>
                </div>
                <div className="portal-form-actions">
                    <button type="submit" className="portal-btn portal-btn-secondary">Update Password</button>
                </div>
            </form>
        </section>
    )
}

export default ProfileForm