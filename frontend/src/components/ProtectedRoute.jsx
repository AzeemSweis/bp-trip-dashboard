import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../lib/auth.js'

/**
 * Wraps a route and redirects to /login if no JWT token is present.
 */
export function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}
