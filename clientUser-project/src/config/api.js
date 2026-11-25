export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function apiFetch(path, options = {}) {
    const token = localStorage.getItem('grti_token')
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    }

    const response = await fetch(`${API_URL}${path}`, { ...options, headers })
    const text = await response.text()
    const data = text ? JSON.parse(text) : {}

    if (!response.ok) {
        throw new Error(data.message || 'Request failed.')
    }
    return data
}