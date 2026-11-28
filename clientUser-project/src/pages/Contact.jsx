import { useState } from 'react'
import './ContentSections.css'

const CONTACT_CARDS = [
    {
        tag: 'Main Branch',
        title: 'Las Piñas Training Center',
        body: 'Block 1, Lot 3, Beacon Place, Naga Road, Pulang Lupa 2, Las Piñas City, Metro Manila, Philippines 1746.',
    },
    {
        tag: 'Direct Hotline',
        title: '0956-224-2221',
        body: 'Call or text our training coordinators for course rates, schedules, and corporate group bookings.',
    },
    {
        tag: 'Nationwide Onsite',
        title: 'Luzon, Visayas & Mindanao',
        body: 'In-house and onsite company or hospital training anywhere in the Philippines (minimum of 10 participants).',
    },
]

const Contact = () => {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [courseInterest, setCourseInterest] = useState('Basic Life Support (CPR & AED)')
    const [message, setMessage] = useState('')
    const [submitted, setSubmitted] = useState('')

    const handleInquiry = (event) => {
        event.preventDefault()
        setSubmitted(
            `Thank you, ${fullName}! Your inquiry for ${courseInterest} has been recorded. You may also reach GRTI directly at 09562242221.`
        )
        setFullName('')
        setEmail('')
        setMessage('')
    }

    return (
        <div className="linear-home">
            <section className="opswat-dark-band" aria-labelledby="contact-heading">
                <div className="opswat-container">
                    <div className="opswat-hero" style={{ paddingBottom: '1.5rem' }}>
                        <span className="linear-pill">
                            <span className="linear-pill-dot" />
                            GRTI Support &amp; Inquiries
                        </span>
                        <h1 id="contact-heading" className="opswat-hero-title">
                            Connect with Good Responder Training Institute
                        </h1>
                        <p className="opswat-hero-sub">
                            Ask about BLS, ACLS, PALS, EMT-B, First Aid, or corporate onsite training across the Philippines.
                        </p>
                    </div>

                    <div className="contact-bento-grid">
                        {CONTACT_CARDS.map((card) => (
                            <article key={card.title} className="contact-glass-card">
                                <span className="linear-bento-tag">{card.tag}</span>
                                <h3>{card.title}</h3>
                                <p>{card.body}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="opswat-light-band" aria-label="Send an Inquiry">
                <div className="opswat-container">
                    <div className="contact-form-card">
                        <h2>Send a Training Inquiry</h2>
                        <p className="portal-subtitle">
                            Share the course and training mode you need, and our team will assist you.
                        </p>

                        {submitted && (
                            <p className="portal-notice" role="status">{submitted}</p>
                        )}

                        <form className="portal-form" style={{ marginBottom: 0 }} onSubmit={handleInquiry}>
                            <div className="portal-form-grid">
                                <div className="portal-field">
                                    <label htmlFor="inq-name">Full Name</label>
                                    <input
                                        id="inq-name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Juan Dela Cruz"
                                        required
                                    />
                                </div>
                                <div className="portal-field">
                                    <label htmlFor="inq-email">Email Address</label>
                                    <input
                                        id="inq-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>
                                <div className="portal-field">
                                    <label htmlFor="inq-course">Course of Interest</label>
                                    <select
                                        id="inq-course"
                                        value={courseInterest}
                                        onChange={(e) => setCourseInterest(e.target.value)}
                                    >
                                        <option>Basic Life Support (CPR &amp; AED)</option>
                                        <option>BLS &amp; Advanced Cardiac Life Support (ACLS)</option>
                                        <option>Pediatric Advanced Life Support (PALS)</option>
                                        <option>Emergency Medical Technician - Basic (EMT-B)</option>
                                        <option>Advanced First Aid</option>
                                        <option>In-House / Corporate Group Training</option>
                                    </select>
                                </div>
                                <div className="portal-field">
                                    <label htmlFor="inq-msg">Message</label>
                                    <input
                                        id="inq-msg"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Preferred dates or participant count"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="portal-form-actions">
                                <button type="submit" className="portal-btn">
                                    Send Inquiry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Contact
