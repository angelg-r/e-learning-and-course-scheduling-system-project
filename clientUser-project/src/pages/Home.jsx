import { useState } from 'react'
import { NavLink } from 'react-router'
import './ContentSections.css'

const PARTNERS = [
    { code: 'ASHI', sub: 'American Safety & Health Inst.' },
    { code: 'ECSI', sub: 'Emergency Care & Safety Inst.' },
    { code: 'IBOEHS', sub: 'Registered Rig Medic' },
    { code: 'IADC', sub: 'Drilling Contractors Assoc.' },
    { code: 'DOLE / DTI', sub: 'Registered Establishment' },
    { code: 'AAOS', sub: 'Orthopaedic Surgeons Affiliate' },
    { code: 'ACEP', sub: 'Emergency Physicians' },
    { code: 'PhilGEPS', sub: 'Gov. Procurement Registered' },
    { code: 'PSEMT', sub: 'EMT-B Recognized' },
]

const OFFERINGS = [
    {
        id: 'catalog',
        icon: '📚',
        label: 'Course Catalogs',
        detail: 'Explore accredited medical, trauma, and safety certification programs from BLS and First Aid to EMT-B and Offshore Rig Medic.',
    },
    {
        id: 'online',
        icon: '💻',
        label: 'Online Training',
        detail: 'Study self-paced lecture modules remotely with online schedules and guided materials before your practical session.',
    },
    {
        id: 'onsite',
        icon: '🏥',
        label: 'On-Site Trainings',
        detail: 'Attend hands-on classroom and skill assessments at our Las Piñas Main Branch (Beacon Place 2, Naga Road).',
    },
    {
        id: 'inhouse',
        icon: '👥',
        label: 'In-House / Group',
        detail: 'Book company or hospital onsite training anywhere in Luzon, Visayas, or Mindanao (minimum of 10 participants).',
    },
    {
        id: 'oneonone',
        icon: '🎯',
        label: '1-to-1 Coaching',
        detail: 'Focused one-on-one instruction tailored to healthcare professionals and specialized responder schedules.',
    },
    {
        id: 'sim3d',
        icon: '🧭',
        label: '3D Simulator',
        detail: 'Practice step-by-step emergency response procedures inside our interactive 3D course simulator.',
    },
]

const MOST_ENROLLED = [
    {
        shield: 'EMT-B',
        sub: 'GRTI',
        category: 'Pre-Hospital Care',
        title: 'Emergency Medical Technician - Basic',
        desc: 'Entry-level pre-hospital emergency care provider certification recognized by PSEMT.',
        price: 'PHP 30,000.00',
    },
    {
        shield: 'BLS',
        sub: 'CPR/AED',
        category: 'Core Certification',
        title: 'Basic Life Support (CPR & AED)',
        desc: 'Revive, resuscitate, and sustain patients experiencing cardiac arrest or respiratory failure.',
        price: 'PHP 2,500.00',
    },
    {
        shield: 'ACLS',
        sub: 'ASHI/ECSI',
        category: 'Advanced Care',
        title: 'BLS & Advanced Cardiac Life Support',
        desc: 'Instructor-led team dynamics, systems of care, and post-cardiac-arrest management.',
        price: 'PHP 4,000.00',
    },
    {
        shield: 'PALS',
        sub: 'CAPCE',
        category: 'Pediatric Care',
        title: 'Pediatric Advanced Life Support',
        desc: 'Scenario-based continuing education for healthcare providers in pediatric emergency care.',
        price: 'PHP 4,000.00',
    },
]

const Home = () => {
    const [activeOffering, setActiveOffering] = useState(OFFERINGS[0])
    const [partnerStart, setPartnerStart] = useState(0)

    const visiblePartners = Array.from({ length: 5 }, (_, idx) => PARTNERS[(partnerStart + idx) % PARTNERS.length])

    return (
        <div className="linear-home">
            <section className="opswat-dark-band" aria-labelledby="hero-heading">
                <div className="opswat-container">
                    <div className="opswat-hero">
                        <span className="linear-pill">
                            <span className="linear-pill-dot" />
                            Established June 2011 &bull; Las Piñas City
                        </span>
                        <h1 id="hero-heading" className="opswat-hero-title">
                            Good Responder Training Institute
                        </h1>
                        <p className="opswat-hero-sub">
                            Providing competitive, accredited health, emergency response, and safety training programs to companies, hospitals, and responders across the Philippines.
                        </p>
                        <div className="linear-cta-row">
                            <NavLink className="linear-btn-primary" to="/goodrespondertraininginstitute/login">
                                Enroll / Log In &rarr;
                            </NavLink>
                            <NavLink className="linear-btn-ghost" to="/goodrespondertraininginstitute/register">
                                Create Trainee Account
                            </NavLink>
                            <NavLink className="linear-btn-ghost" to="/goodrespondertraininginstitute/contact">
                                Inquire Now
                            </NavLink>
                        </div>
                    </div>
                </div>
            </section>

            <section className="opswat-light-band" aria-label="Accreditations, Offerings, Credentials, and Most Enrolled Courses">
                <div className="opswat-container">
                    <div className="opswat-section-head">
                        <h2>Our Accreditations &amp; Partners</h2>
                        <p>
                            Registered with DTI, DOLE, and PhilGEPS, and accredited by international medical and safety organizations.
                        </p>
                    </div>

                    <div className="opswat-partners-row">
                        <button
                            type="button"
                            className="opswat-arrow-btn"
                            aria-label="Previous partners"
                            onClick={() => setPartnerStart((prev) => (prev - 1 + PARTNERS.length) % PARTNERS.length)}
                        >
                            &lsaquo;
                        </button>
                        <div className="opswat-partners-grid">
                            {visiblePartners.map((p) => (
                                <div key={p.code} className="opswat-partner-chip">
                                    <strong>{p.code}</strong>
                                    <span>{p.sub}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="opswat-arrow-btn"
                            aria-label="Next partners"
                            onClick={() => setPartnerStart((prev) => (prev + 1) % PARTNERS.length)}
                        >
                            &rsaquo;
                        </button>
                    </div>

                    <div className="opswat-section-head">
                        <h2>GRTI Training Offerings</h2>
                        <p>
                            Select a training format below to see how Good Responder Training Institute delivers medical and safety readiness.
                        </p>
                    </div>

                    <div className="opswat-offerings-grid" role="tablist" aria-label="GRTI Training Offerings">
                        {OFFERINGS.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                role="tab"
                                aria-selected={activeOffering.id === item.id}
                                className={`opswat-offering-card ${activeOffering.id === item.id ? 'is-active' : ''}`}
                                onClick={() => setActiveOffering(item)}
                            >
                                <span className="opswat-offering-icon" aria-hidden="true">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="opswat-offering-detail" role="tabpanel">
                        <strong>{activeOffering.label}:</strong> {activeOffering.detail}
                    </div>

                    <div className="opswat-credentials-split" style={{ marginTop: '4rem' }}>
                        <div>
                            <h2>Globally &amp; Locally Recognized Credentials</h2>
                            <p className="opswat-credentials-eyebrow">ASHI, ECSI, IBOEHS &amp; DOLE Accredited</p>
                            <p>
                                GRTI is accredited by the American Safety and Health Institute (ASHI), Emergency Care and Safety Institute (ECSI) with AAOS and ACEP affiliates, IBOEHS Registered Rig Medic Certification, IADC, and PSEMT.
                            </p>
                            <p>
                                Courses also suffice for Department of Labor and Employment (DOLE) Basic Life Support and First Aid Training requirements nationwide.
                            </p>
                        </div>

                        <div className="opswat-credential-badge-card">
                            <div className="opswat-credential-mark">
                                <strong>ASHI</strong>
                                <span>ECSI &bull; AAOS</span>
                            </div>
                            <div className="opswat-credential-divider" />
                            <div className="opswat-credential-mark">
                                <strong>IBOEHS</strong>
                                <span>IADC &bull; PSEMT</span>
                            </div>
                        </div>
                    </div>

                    <div className="opswat-section-head">
                        <h2>Most Enrolled Courses</h2>
                        <p>Explore our flagship medical and emergency response certifications.</p>
                    </div>

                    <div className="opswat-courses-grid">
                        {MOST_ENROLLED.map((c) => (
                            <article key={c.title} className="opswat-course-card">
                                <div className="opswat-course-banner">
                                    <div className="opswat-shield">
                                        <strong>{c.shield}</strong>
                                        <span>{c.sub}</span>
                                    </div>
                                </div>
                                <div className="opswat-course-body">
                                    <span className="opswat-course-cat">{c.category}</span>
                                    <h3>{c.title}</h3>
                                    <p>{c.desc}</p>
                                    <div className="opswat-course-footer">
                                        <span>{c.price}</span>
                                        <NavLink to="/goodrespondertraininginstitute/login">Enroll Now &rarr;</NavLink>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="opswat-view-all-row">
                        <NavLink className="linear-btn-primary" to="/goodrespondertraininginstitute/login">
                            View All Courses &amp; Schedules
                        </NavLink>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
