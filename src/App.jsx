import './App.css'
import AboutGRTI from './pages/About'
import ContactGRTI from './pages/Contact'
import HomeGRTI from './pages/Home'
import { Navigate, Route, Routes } from 'react-router'
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
          <Route path="goodrespondertraininginstitute/home" element={<HomeGRTI />} />
          <Route path="goodrespondertraininginstitute/about" element={<AboutGRTI />} />
          <Route path="goodrespondertraininginstitute/contact" element={<ContactGRTI />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
