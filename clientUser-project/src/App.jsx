import './App.css'
import ContactGRTI from './pages/Contact'
import HomeGRTI from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import { Navigate, Route, Routes } from 'react-router'
import SiteHeader from './components/SiteHeader/SiteHeader'
import SiteFooter from './components/SiteFooter/SiteFooter'
import PortalLayout from './components/PortalLayout/PortalLayout'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

// Client Side: Trainee Modules
import TraineeProfile from './modules/Trainee/AuthProfile/ProfilePage'
import TraineeDashboard from './modules/Trainee/Dashboard/TraineeDashboard'
import ELearningPortal from './modules/Trainee/ELearningPortal/ELearningPortal'
import ScheduleViewer from './modules/Trainee/ScheduleViewer/ScheduleViewer'
import OnlineReservation from './modules/Trainee/OnlineReservation/OnlineReservation'
import Simulator3D from './modules/Trainee/Simulator3D/Simulator3D'

// Client Side: Trainor Modules
import TrainorProfile from './modules/Trainor/AuthProfile/TrainorProfile'
import MyPlottedSchedule from './modules/Trainor/MyPlottedSchedule/MyPlottedSchedule'
import ReservedTraineesRoster from './modules/Trainor/ReservedTraineesRoster/ReservedTraineesRoster'
import CourseMaterials from './modules/Trainor/CourseMaterials/CourseMaterials'
import AvailabilityRequest from './modules/Trainor/AvailabilityRequest/AvailabilityRequest'

// Admin Side Modules
import AdminDashboard from './modules/Admin/Dashboard/AdminDashboard'
import UserInstructorManagement from './modules/Admin/UserInstructorManagement/UserInstructorManagement'
import CourseContentManagement from './modules/Admin/CourseContentManagement/CourseContentManagement'
import VenueManagement from './modules/Admin/VenueManagement/VenueManagement'
import InteractiveSchedulePlotter from './modules/Admin/InteractiveSchedulePlotter/InteractiveSchedulePlotter'
import ReservationManagement from './modules/Admin/ReservationManagement/ReservationManagement'
import DatabaseBackupMaintenance from './modules/Admin/DatabaseBackupMaintenance/DatabaseBackupMaintenance'

const roleRoutes = [
  {
    role: 'trainee',
    base: 'goodrespondertraininginstitute/trainee',
    roleLabel: 'Client Side',
    portalTitle: 'Trainee Portal',
    defaultChild: 'dashboard',
    children: [
      { path: 'dashboard', label: 'Dashboard', element: <TraineeDashboard /> },
      { path: 'portal', label: 'E-Learning Portal', element: <ELearningPortal /> },
      { path: 'simulator', label: '3D Simulator', element: <Simulator3D /> },
      { path: 'schedules', label: 'Schedule Viewer', element: <ScheduleViewer /> },
      { path: 'reservations', label: 'Online Reservation', element: <OnlineReservation /> },
      { path: 'profile', label: 'Profile & Account', element: <TraineeProfile /> },
    ],
  },
  {
    role: 'trainor',
    base: 'goodrespondertraininginstitute/trainor',
    roleLabel: 'Client Side',
    portalTitle: 'Trainor Portal',
    defaultChild: 'schedule',
    children: [
      { path: 'schedule', label: 'My Plotted Schedule', element: <MyPlottedSchedule /> },
      { path: 'roster', label: 'Reserved Trainees', element: <ReservedTraineesRoster /> },
      { path: 'materials', label: 'Course Materials', element: <CourseMaterials /> },
      { path: 'availability', label: 'Availability Request', element: <AvailabilityRequest /> },
      { path: 'profile', label: 'Profile & Account', element: <TrainorProfile /> },
    ],
  },
  {
    role: 'admin',
    base: 'goodrespondertraininginstitute/admin',
    roleLabel: 'Admin Side',
    portalTitle: 'Admin Console',
    defaultChild: 'dashboard',
    children: [
      { path: 'dashboard', label: 'Dashboard', element: <AdminDashboard /> },
      { path: 'users', label: 'Users & Instructors', element: <UserInstructorManagement /> },
      { path: 'courses', label: 'Courses & Content', element: <CourseContentManagement /> },
      { path: 'venues', label: 'Venue Management', element: <VenueManagement /> },
      { path: 'schedule-plotter', label: 'Schedule Plotter', element: <InteractiveSchedulePlotter /> },
      { path: 'reservations', label: 'Reservations', element: <ReservationManagement /> },
      { path: 'maintenance', label: 'Backup & Maintenance', element: <DatabaseBackupMaintenance /> },
    ],
  },
]

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <SiteHeader />

        <main className="page-content">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/goodrespondertraininginstitute/home" replace />}
            />

            <Route path="goodrespondertraininginstitute/home" element={<HomeGRTI />} />
            <Route path="goodrespondertraininginstitute/contact" element={<ContactGRTI />} />
            <Route path="goodrespondertraininginstitute/login" element={<Login />} />
            <Route path="goodrespondertraininginstitute/register" element={<Register />} />

            {roleRoutes.map(({ role, base, roleLabel, portalTitle, defaultChild, children }) => (
              <Route key={base} element={<ProtectedRoute allowedRoles={[role]} />}>
                <Route
                  path={base}
                  element={
                    <PortalLayout
                      roleLabel={roleLabel}
                      portalTitle={portalTitle}
                      base={base}
                      navItems={children.map(({ path, label }) => ({ path, label }))}
                    />
                  }
                >
                  <Route
                    index
                    element={<Navigate to={`/${base}/${defaultChild}`} replace />}
                  />
                  {children.map(({ path, element }) => (
                    <Route key={path} path={path} element={element} />
                  ))}
                  {role === 'trainee' && (
                    <Route path="portal/simulator/:courseId" element={<Simulator3D />} />
                  )}
                </Route>
              </Route>
            ))}
          </Routes>
        </main>

        <SiteFooter />
      </div>
    </AuthProvider>
  )
}

export default App