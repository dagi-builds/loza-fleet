import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import OwnerLoginPage from './pages/OwnerLoginPage'
import OwnerDashboard from './pages/OwnerDashboard'
import DriverLoginPage from './pages/DriverLoginPage'
import DriverDashboard from './pages/DriverDashboard'
import ManagerDashboard from './pages/ManagerDashboard'

function AppContent() {
  const [page, setPage] = useState('landing')
  const [driver, setDriver] = useState(null)
  const [adminRole, setAdminRole] = useState(null)
  const [managerData, setManagerData] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  const isAdminRoute = location.pathname === '/abu'

  useEffect(() => {
    if (isAdminRoute && page === 'landing') setPage('adminLogin')
  }, [isAdminRoute])

  // DRIVER FLOW
  if (!isAdminRoute && page === 'landing')
    return <LandingPage onDriver={() => setPage('driverLogin')} />

  if (page === 'driverLogin')
    return <DriverLoginPage
      onSuccess={d => { setDriver(d); setPage('driverDashboard') }}
      onBack={() => { setPage('landing'); navigate('/') }}
    />

  if (page === 'driverDashboard')
    return <DriverDashboard
      driver={driver}
      onLogout={() => { setDriver(null); setPage('landing'); navigate('/') }}
    />

  // ADMIN FLOW — secret /abu route
  if (page === 'adminLogin' || (isAdminRoute && page === 'landing'))
    return <OwnerLoginPage
      onOwnerSuccess={() => { setAdminRole('owner'); setPage('ownerDashboard') }}
      onManagerSuccess={mgr => { setAdminRole('manager'); setManagerData(mgr); setPage('managerDashboard') }}
      onBack={() => { setPage('landing'); navigate('/') }}
    />

  if (page === 'ownerDashboard')
    return <OwnerDashboard
      onLogout={() => { setAdminRole(null); setPage('landing'); navigate('/') }}
    />

  if (page === 'managerDashboard')
    return <ManagerDashboard
      manager={managerData}
      onLogout={() => { setManagerData(null); setAdminRole(null); setPage('landing'); navigate('/') }}
    />

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  )
}