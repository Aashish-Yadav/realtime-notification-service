import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg-base)',
      }}>
        <div className="spinner" style={{ width: '28px', height: '28px' }} />
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}