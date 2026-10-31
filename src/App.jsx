import { useState } from 'react'
import './App.css'
import AboutGRTI from './pages/About'
import ContactGRTI from './pages/Contact'
import HomeGRTI from './pages/Home'

function App() {
  const [activePage, setActivePage] = useState('home')

  return (
    <div className="app">
      <header className="site-header">
      <h1>Good Responder Training Institute</h1>
        <nav className="site-nav" aria-label="Main navigation">
          <button type="button" onClick={() => setActivePage('home')}>Home</button>
          <button type="button" onClick={() => setActivePage('about')}>About</button>
          <button type="button" onClick={() => setActivePage('contact')}>Contact</button>
        </nav>
      </header>
      <main className="page-content">
        {activePage === 'home' && <HomeGRTI />}
        {activePage === 'about' && <AboutGRTI />}
        {activePage === 'contact' && <ContactGRTI />}
      </main>
    </div>
  )
}

export default App
