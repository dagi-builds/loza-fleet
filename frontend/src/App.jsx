import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import OwnerLoginPage from './pages/OwnerLoginPage'
import OwnerDashboard from './pages/OwnerDashboard'
import DriverLoginPage from './pages/DriverLoginPage'
import DriverDashboard from './pages/DriverDashboard'
import ManagerLoginPage from './pages/ManagerLoginPage'
import ManagerDashboard from './pages/ManagerDashboard'

function AppContent() {
  const [page, setPage] = useState('landing')
  const [driver, setDriver] = useState(null)
  const [adminRole, setAdminRole] = useState(null)
  const [managerData, setManagerData] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  const isAdminRoute = location.pathname === '/abu'
  const isManagerRoute = location.pathname === '/manager'

  useEffect(() => {
    if (isAdminRoute && page === 'landing') setPage('adminLogin')
    if (isManagerRoute && page === 'landing') setPage('managerLogin')
  }, [isAdminRoute, isManagerRoute])

  // ── DRIVER FLOW ────────────────────────────────────────────
  if (!isAdminRoute && !isManagerRoute && page === 'landing')
    return (
      <LandingPage
        onDriver={() => setPage('driverLogin')}
        onOwner={() => { navigate('/abu'); setPage('adminLogin') }}
        onManager={() => { navigate('/manager'); setPage('managerLogin') }}
      />
    )

  if (page === 'driverLogin')
    return (
      <DriverLoginPage
        onSuccess={d => { setDriver(d); setPage('driverDashboard') }}
        onBack={() => { setPage('landing'); navigate('/') }}
      />
    )

  if (page === 'driverDashboard')
    return (
      <DriverDashboard
        driver={driver}
        onLogout={() => { setDriver(null); setPage('landing'); navigate('/') }}
      />
    )

  // ── MANAGER FLOW ───────────────────────────────────────────
  if (page === 'managerLogin')
    return (
      <ManagerLoginPage
        onSuccess={mgr => { setManagerData(mgr); setPage('managerDashboard') }}
        onBack={() => { setPage('landing'); navigate('/') }}
      />
    )

  if (page === 'managerDashboard')
    return (
      <ManagerDashboard
        manager={managerData}
        onLogout={() => { setManagerData(null); setPage('landing'); navigate('/') }}
      />
    )

  // ── OWNER/ADMIN FLOW ───────────────────────────────────────
  if (page === 'adminLogin' || (isAdminRoute && page === 'landing'))
    return (
      <OwnerLoginPage
        onOwnerSuccess={() => { setAdminRole('owner'); setPage('ownerDashboard') }}
        onManagerSuccess={mgr => { setAdminRole('manager'); setManagerData(mgr); setPage('ownerDashboard') }}
        onBack={() => { setPage('landing'); navigate('/') }}
      />
    )

  if (page === 'ownerDashboard')
    return (
      <OwnerDashboard
        role={adminRole}
        managerData={managerData}
        onLogout={() => { setAdminRole(null); setManagerData(null); setPage('landing'); navigate('/') }}
      />
    )

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