import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import OwnerLoginPage from './pages/OwnerLoginPage'
import OwnerDashboard from './pages/OwnerDashboard'
import DriverLoginPage from './pages/DriverLoginPage'
import DriverDashboard from './pages/DriverDashboard'

export default function App() {
  const [page, setPage] = useState('landing')
  const [driver, setDriver] = useState(null)

  if (page === 'landing')
    return <LandingPage onDriver={() => setPage('driverLogin')} onOwner={() => setPage('ownerLogin')} />

  if (page === 'ownerLogin')
    return <OwnerLoginPage onSuccess={() => setPage('ownerDashboard')} onBack={() => setPage('landing')} />

  if (page === 'ownerDashboard')
    return <OwnerDashboard onLogout={() => setPage('landing')} />

  if (page === 'driverLogin')
    return <DriverLoginPage onSuccess={d => { setDriver(d); setPage('driverDashboard') }} onBack={() => setPage('landing')} />

  if (page === 'driverDashboard')
    return <DriverDashboard driver={driver} onLogout={() => { setDriver(null); setPage('landing') }} />

  return null
}