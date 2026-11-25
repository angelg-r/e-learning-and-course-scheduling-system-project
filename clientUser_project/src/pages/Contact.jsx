import './ContentSections.css'

const contactSections = [
    {
        tone: 'black',
        title: 'Contact GRTI',
        body: 'Have a question about a course or training schedule? Get in touch with Good Responder Training Institute to discuss your enquiry.',
    },
    {
        tone: 'white',
        title: 'Tell us what you need',
        body: 'Share the course you are interested in, your preferred training mode, and a suitable time to connect so your enquiry has the details GRTI needs.',
    },
    {
        tone: 'gray',
        title: 'Ask about training options',
        body: 'Contact GRTI about Office Training, Virtual Training, Group Training, or 1-to-1 Training, and ask which courses and schedules are currently available.',
    },
]

const Contact = () => {
    return (
        <div className="content-sections">
            {contactSections.map(({ tone, title, body }, index) => {
                const headingId = `contact-section-${index + 1}`

                return (
                    <section
                        className={`content-section content-section--${tone}`}
                        key={headingId}
                        aria-labelledby={headingId}
                    >
                        <div className="content-section-inner">
                            <p className="content-section-index">{String(index + 1).padStart(2, '0')} / 03</p>
                            <div className="content-section-copy">
                                <h2 id={headingId}>{title}</h2>
                                <p>{body}</p>
                            </div>
                        </div>
                    </section>
                )
            })}
        </div>
    )
}

export default Contact