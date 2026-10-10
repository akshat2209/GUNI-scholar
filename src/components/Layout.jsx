import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity, BarChart3, BookOpen, ClipboardList, FileQuestion, GraduationCap,
  LayoutDashboard, LogOut, Menu, Network, UserCircle, Users, X, Flame, Shield,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Badge } from './ui'

const Mark = ({ size = 34 }) => (
  <svg className="mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="13" r="4.5" fill="#eb2b30" />
    <path d="M32 57 C 27.5 45 27.5 33 32 21 C 36.5 33 36.5 45 32 57 Z" fill="#eb2b30" />
    <path d="M30.5 57 C 20 49.5 13.5 40 12.5 27 C 22.5 33.5 29 43.5 30.5 57 Z" fill="#c41e24" />
    <path d="M33.5 57 C 44 49.5 50.5 40 51.5 27 C 41.5 33.5 35 43.5 33.5 57 Z" fill="#c41e24" />
  </svg>
)

export const BrandLockup = () => (
  <Link to="/" className="sidebar-brand" aria-label="GUNI Scholar home">
    <Mark />
    <span>
      <span className="name">GUNI Scholar</span><br />
      <span className="uni">Ganpat University</span>
    </span>
  </Link>
)

const NAV = {
  student: [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/student/courses', label: 'My Courses', icon: BookOpen },
    { to: '/student/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/student/assessments', label: 'Assessments', icon: FileQuestion },
    { to: '/student/analytics', label: 'My Analytics', icon: BarChart3 },
    { to: '/student/knowledge-map', label: 'Knowledge Map', icon: Network },
    { to: '/student/study-plan', label: 'Study Plan', icon: Activity },
  ],
  faculty: [
    { to: '/faculty', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/faculty/courses', label: 'My Courses', icon: BookOpen },
    { to: '/faculty/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/faculty/assessments', label: 'Assessments', icon: FileQuestion },
    { to: '/faculty/evaluation', label: 'Evaluation', icon: GraduationCap },
    { to: '/faculty/students', label: 'Students Roster', icon: Users },
    { to: '/faculty/heatmap', label: 'Confusion Heatmap', icon: Flame },
  ],
  dean: [
    { to: '/dean', label: 'Academic Overview', icon: BarChart3, end: true },
  ],
  admin: [
    { to: '/admin', label: 'Platform Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users & Roles', icon: Users },
    { to: '/admin/courses', label: 'Course Curriculum', icon: BookOpen },
  ],
}

const PORTAL_NAMES = {
  student: 'Student Portal',
  faculty: 'Faculty Portal',
  dean: 'Dean Portal',
  admin: 'Admin Portal',
}

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [location.pathname])

  if (!user) return null

  const items = NAV[user.role] || []
  const roleName = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'
  const initials = (user.name || user.email || 'GU')
    .split(' ')
    .filter((w) => !w.endsWith('.'))
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'GU'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="shell">
      <a href="#main" className="skip-link">Skip to main content</a>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main Navigation">
        <BrandLockup />

        <nav className="sidebar-nav">
          <div className="nav-section-title">{PORTAL_NAMES[user.role] || 'Academic Portal'}</div>
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="nav-section-title" style={{ marginTop: 12 }}>Account</div>
          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <UserCircle aria-hidden="true" />
            <span>My Profile</span>
          </NavLink>
        </nav>

        {/* Sidebar Bottom Footer (Anchored reliably at bottom) */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <span className={`avatar ${user.role}`} aria-hidden="true">
              {initials}
            </span>
            <div className="who">
              <span className="user-name" title={user.name || user.email}>
                {user.name || user.email}
              </span>
              <div className="user-role">
                <Badge tone={user.role}>{roleName}</Badge>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
            aria-label="Sign out of your account"
          >
            <LogOut size={15} aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {open && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation sidebar"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="btn btn-ghost btn-icon menu-btn"
              aria-label="Toggle navigation menu"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
            <div className="topbar-title">
              <Badge tone={user.role}>{roleName.toUpperCase()}</Badge>
              <span className="topbar-name">
                {user.department?.name || user.dept || 'Ganpat University'}
              </span>
            </div>
          </div>

          <div className="topbar-actions">
            <Link to="/profile" className="topbar-profile-pill" title="View Profile">
              <span className={`avatar ${user.role}`} style={{ width: 26, height: 26, fontSize: 11 }}>
                {initials}
              </span>
              <span>{user.name || user.email}</span>
            </Link>
          </div>
        </header>

        <main id="main" className="content-area" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
