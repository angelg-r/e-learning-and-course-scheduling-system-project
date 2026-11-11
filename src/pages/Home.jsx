import './Home.css'
import { NavLink } from 'react-router'

const homeSections = [
    {
        tone: 'black',
        title: 'About GRTI',
        body: 'Good Responder Training Institute (GRTI) brings course learning and training options together in one place. Explore a subject, choose a format, and plan your next step in learning.',
    },
    {
        tone: 'white',
        title: 'Find a course to explore',
        body: 'Start with the knowledge or skills you want to build. Contact GRTI to learn which courses are currently available and when they are scheduled.',
    },
    {
        tone: 'gray',
        title: 'Choose your training mode',
        body: 'Select a format that works for your learning needs and schedule.',
        options: ['Office Training', 'Virtual Training', 'Group Training', '1-to-1 Training'],
    },
    {
        tone: 'black',
        title: 'Office Training',
        body: 'Take part in face-to-face training in an office setting. Contact GRTI to discuss available sessions, location, and scheduling.',
    },
    {
        tone: 'white',
        title: 'Virtual Training',
        body: 'Join training remotely from a location that suits you. Ask GRTI about upcoming virtual sessions and any requirements before your course.',
    },
    {
        tone: 'gray',
        title: 'Group or 1-to-1 Training',
        body: 'Learn together in a group or choose focused one-to-one instruction. Contact GRTI to discuss the format that best fits your needs.',
    },
    {
        tone: 'black',
        title: 'Plan your next step',
        body: 'Have a question about courses, training modes, or scheduling? Get in touch with GRTI to discuss your options.',
        contactLink: true,
    },
]

const Home = () => (
    <div className="home-sections">
        {homeSections.map(({ tone, title, body, options, contactLink }, index) => {
            const headingId = `home-section-${index + 1}`

            return (
                <section
                    className={`home-section home-section--${tone}`}
                    key={headingId}
                    aria-labelledby={headingId}
                >
                    <div className="home-section-inner">
                        <p className="home-section-index">{String(index + 1).padStart(2, '0')} / 07</p>
                        <div className="home-section-copy">
                            <h2 id={headingId}>{title}</h2>
                            <p>{body}</p>
                            {options && (
                                <ul className="home-training-options">
                                    {options.map((option) => <li key={option}>{option}</li>)}
                                </ul>
                            )}
                            {contactLink && (
                                <NavLink className="home-contact-link" to="/goodrespondertraininginstitute/contact">
                                    Contact Us
                                </NavLink>
                            )}
                        </div>
                    </div>
                </section>
            )
        })}
    </div>
)

export default Home