import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Sites from './pages/Sites'
import SiteDetail from './pages/SiteDetail'
import Notify from './pages/Notify'
import Settings from './pages/Settings'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index          element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"    element={<Dashboard />} />
              <Route path="sites"        element={<Sites />} />
              <Route path="sites/:id"    element={<SiteDetail />} />
              <Route path="notify"       element={<Notify />} />
              <Route path="settings"     element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}