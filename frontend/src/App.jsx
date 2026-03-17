import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getDarkMode, applyDarkMode } from './lib/darkMode.js'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { AdminLayout } from './components/AdminLayout.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { TripList } from './pages/TripList.jsx'
import { TripDetail } from './pages/TripDetail.jsx'
import { GuestChecklistManager } from './pages/GuestChecklistManager.jsx'
import { GuestDashboard } from './pages/GuestDashboard.jsx'

export default function App() {
  useEffect(() => {
    applyDarkMode(getDarkMode())
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/trip/:tripId/guest/:guestToken" element={<GuestDashboard />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/trips" replace />} />
          <Route path="trips" element={<TripList />} />
          <Route path="trips/:tripId" element={<TripDetail />} />
          <Route path="trips/:tripId/guests/:guestId" element={<GuestChecklistManager />} />
        </Route>
        <Route path="/" element={<Navigate to="/admin/trips" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
