import './App.css'
import AboutGRTI from './pages/About'
import ContactGRTI from './pages/Contact'
import HomeGRTI from './pages/Home'
import { Routes, Route } from 'react-router'
import NavigationBar from './components/NavigationBar/NavigationBar'

function App() {

  return (
    <div className="app">
      <header className="site-header">
        <h1>Good Responder Training Institute</h1>
        <NavigationBar />
      </header>
      <main className="page-content">
        <Routes>
          <Route path="/home" element={<HomeGRTI />} />
          <Route path="/about" element={<AboutGRTI />} />
          <Route path="/contact" element={<ContactGRTI />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
