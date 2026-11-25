import { useEffect, useState } from 'react'
import { apiFetch } from '../../../config/api'

export default function UserInstructorManagement() {
  const [users, setUsers] = useState([])
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('trainor')
  const [roleFilter, setRoleFilter] = useState('all')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiFetch('/api/users')
      .then((data) => { if (active) setUsers(data.users || []) })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  const handleAdd = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const data = await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, role }),
      })
      setUsers((prev) => [data.user, ...prev])
      setNotice(`Added ${fullName} as ${role}.`)
      setFullName('')
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err.message)
    }
  }

  const updateRole = async (id, nextRole) => {
    setError('')
    try {
      const data = await apiFetch(`/api/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: nextRole }),
      })
      setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)))
      setNotice(`Updated ${data.user.fullName}'s role to ${nextRole}.`)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRemove = async (id, name) => {
    try {
      await apiFetch(`/api/users/${id}`, { method: 'DELETE' })
      setUsers((prev) => prev.filter((item) => item._id !== id))
      setNotice(`Removed ${name}.`)
    } catch (err) {
      setError(err.message)
    }
  }

  const filtered = users.filter((u) => roleFilter === 'all' || u.role === roleFilter)

  return (
    <section className="module-container">
      <h1>User &amp; Instructor Management</h1>
      <p className="portal-subtitle">Create accounts and manage Trainee, Trainor, and Admin roles in MongoDB.</p>

      {notice && <p className="portal-notice" role="status">{notice}</p>}
      {error && <p className="portal-notice portal-notice-error" role="alert">{error}</p>}

      <form className="portal-form" onSubmit={handleAdd}>
        <div className="portal-form-grid">
          <div className="portal-field">
            <label htmlFor="user-name">Full Name</label>
            <input id="user-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="portal-field">
            <label htmlFor="user-email">Email</label>
            <input id="user-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="portal-field">
            <label htmlFor="user-pass">Initial Password</label>
            <input id="user-pass" type="password" minLength={8} placeholder="Default: 12345678" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="portal-field">
            <label htmlFor="user-role">Role</label>
            <select id="user-role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="trainee">Trainee</option>
              <option value="trainor">Trainor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="portal-form-actions">
          <button type="submit" className="portal-btn">Add User</button>
        </div>
      </form>

      <div className="portal-toolbar">
        <select aria-label="Filter users by role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="trainee">Trainee</option>
          <option value="trainor">Trainor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u._id}>
                <td><strong>{u.fullName}</strong></td>
                <td>{u.email}</td>
                <td>
                  <select
                    aria-label={`Role for ${u.fullName}`}
                    className={`portal-role-select role-${u.role}`}
                    value={u.role}
                    onChange={(e) => updateRole(u._id, e.target.value)}
                  >
                    <option value="trainee">Trainee</option>
                    <option value="trainor">Trainor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button type="button" className="portal-btn portal-btn-sm portal-btn-danger" onClick={() => handleRemove(u._id, u.fullName)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}