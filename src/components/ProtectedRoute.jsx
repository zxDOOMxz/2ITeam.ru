import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, adminOnly = false, staffOnly = false }) {
  const { session, isAdmin, isStaff, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="container section">
        <p className="muted">Загрузка…</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/cabinet" replace />
  }

  if (staffOnly && !isStaff) {
    return <Navigate to="/cabinet" replace />
  }

  return children
}
