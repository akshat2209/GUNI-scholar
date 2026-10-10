import { Link } from 'react-router-dom'
import { useAuth, roleHome } from '../context/AuthContext'

export default function NotFound() {
  const { user } = useAuth()
  return (
    <div className="legal-page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <h1 style={{ fontSize: 42 }}>Page not found</h1>
      <p className="muted mt-8" style={{ fontSize: 15 }}>
        The page you requested does not exist or has moved.
      </p>
      <p className="mt-24">
        <Link className="btn btn-primary" to={user ? roleHome(user.role) : '/login'}>
          Go to your dashboard
        </Link>
      </p>
    </div>
  )
}
