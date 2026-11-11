import './App.css'
import ContactGRTI from './pages/Contact'
import HomeGRTI from './pages/Home'
import { Route, Routes } from 'react-router'
import SiteHeader from './components/SiteHeader/SiteHeader'
import SiteFooter from './components/SiteFooter/SiteFooter'

function App() {

  return (
    <div className="app">
      <SiteHeader />
      <main className="page-content">
        <Routes>
          <Route path="goodrespondertraininginstitute/home" element={<HomeGRTI />} />
          <Route path="goodrespondertraininginstitute/contact" element={<ContactGRTI />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  )
}

export default App
