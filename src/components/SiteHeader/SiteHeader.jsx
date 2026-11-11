import './SiteHeader.css'
import NavigationBar from '../NavigationBar/NavigationBar'

function SiteHeader() {
    return (
        <header className="site-header">
            <h1>Good Responder Training Institute</h1>
            <NavigationBar />
        </header>
    )
}

export default SiteHeader