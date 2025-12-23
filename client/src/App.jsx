import { Routes, Route } from 'react-router'
import ActivityLogsPage from './pages/admin/ActivityLogsPage'
import CalendarPage from './pages/admin/CalendarPage'
import DriverListPage from './pages/admin/DriverManagement'
import TruckListPage from './pages/admin/TruckManagement'
import { ToastContainer, Slide } from 'react-toastify'
import { UserProvider } from './contexts/UserContext'
import Deployments from './pages/admin/Deployments'
import Dashboard from './pages/admin/Dashboard'
import UserLayout from './layout/UserLayout'
import ViewerListPage from './pages/admin/VisitorManagement'
import AdminManagement from './pages/admin/AdminManagement'
import LoginPage from './pages/public/LoginPage'
import SignupPage from './pages/public/SignupPage'
import TimelineLogs from './pages/admin/TimelineLogs'
import MyProfile from './pages/admin/MyProfile'

function App () {
  return (
    <>
      <ToastContainer
        position='bottom-right'
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='colored'
        transition={Slide}
      />

      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/signup' element={<SignupPage />} />

        {/* admin page */}
        <Route
          element={
            <UserProvider>
              <UserLayout />
            </UserProvider>
          }
        >
          <Route path='/secure/my-profile' element={<MyProfile />} />

          <Route path='/secure/dashboard' element={<Dashboard />} />
          <Route path='/secure/calendar' element={<CalendarPage />} />
          <Route path='/secure/deployment-logs' element={<TimelineLogs />} />
          <Route path='/secure/deployments' element={<Deployments />} />

          <Route
            path='/secure/driver-management'
            element={<DriverListPage />}
          />
          <Route path='/secure/truck-management' element={<TruckListPage />} />
          <Route
            path='/secure/visitor-management'
            element={<ViewerListPage />}
          />
          <Route
            path='/secure/admin-management'
            element={<AdminManagement />}
          />
          <Route path='/secure/activity-logs' element={<ActivityLogsPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
