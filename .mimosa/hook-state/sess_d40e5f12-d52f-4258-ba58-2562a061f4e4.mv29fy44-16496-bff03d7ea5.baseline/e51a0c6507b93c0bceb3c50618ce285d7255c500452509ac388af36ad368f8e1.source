import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Card, Field, PageHeader, Badge } from '../components/ui'

export default function Profile() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const initials = (user?.name || user?.email || 'GU')
    .split(' ')
    .filter((w) => !w.endsWith('.'))
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'GU'

  function savePassword(e) {
    e.preventDefault()
    const errs = {}
    if (form.current.length < 6) errs.current = 'Enter your current password.'
    if (form.next.length < 8) errs.next = 'New password must be at least 8 characters.'
    if (form.next !== form.confirm) errs.confirm = 'Passwords do not match.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    toast('Password updated successfully.')
    setForm({ current: '', next: '', confirm: '' })
  }

  const roleName = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'

  return (
    <div className="page">
      <PageHeader title="My Profile" sub="Your account details, role and access level on GUNI Scholar." />

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <Card title="Account Details">
          <div className="flex mb-16" style={{ gap: 16 }}>
            <span className={`avatar ${user?.role}`} style={{ width: 54, height: 54, fontSize: 18 }} aria-hidden="true">
              {initials}
            </span>
            <div>
              <h3 style={{ fontSize: 18 }}>{user?.name || user?.email}</h3>
              <div className="mt-4">
                <Badge tone={user?.role}>{roleName}</Badge>
              </div>
            </div>
          </div>

          <dl style={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: 12, fontSize: 14 }}>
            <dt className="muted">Email Address</dt>
            <dd style={{ fontWeight: 500 }}>{user?.email}</dd>

            <dt className="muted">Department</dt>
            <dd style={{ fontWeight: 500 }}>{user?.department?.name || user?.dept || 'Ganpat University'}</dd>

            {user?.role === 'student' ? (
              <>
                <dt className="muted">Roll Number</dt>
                <dd style={{ fontWeight: 500 }}>{user?.rollNo || 'N/A'}</dd>
                <dt className="muted">Current Semester</dt>
                <dd style={{ fontWeight: 500 }}>Semester {user?.sem || 1}</dd>
              </>
            ) : (
              <>
                <dt className="muted">Staff ID</dt>
                <dd style={{ fontWeight: 500 }}>{user?.staffId || 'GU-FACULTY'}</dd>
              </>
            )}
            <dt className="muted">Account Status</dt>
            <dd><Badge tone="ok">Active</Badge></dd>
          </dl>

          <hr className="divider" />
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => { logout(); navigate('/login') }}
          >
            <LogOut size={16} aria-hidden="true" /> Sign out of GUNI Scholar
          </button>
        </Card>

        <Card title="Change Password">
          <form onSubmit={savePassword} noValidate>
            <Field label="Current password" htmlFor="cur" error={errors.current}>
              <input
                id="cur"
                className="input"
                type="password"
                autoComplete="current-password"
                value={form.current}
                onChange={(e) => setForm({ ...form, current: e.target.value })}
                aria-invalid={!!errors.current}
              />
            </Field>
            <Field label="New password" htmlFor="next" error={errors.next} hint="At least 8 characters.">
              <input
                id="next"
                className="input"
                type="password"
                autoComplete="new-password"
                value={form.next}
                onChange={(e) => setForm({ ...form, next: e.target.value })}
                aria-invalid={!!errors.next}
              />
            </Field>
            <Field label="Confirm new password" htmlFor="conf" error={errors.confirm}>
              <input
                id="conf"
                className="input"
                type="password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                aria-invalid={!!errors.confirm}
              />
            </Field>
            <button className="btn btn-primary" type="submit">Update password</button>
          </form>
        </Card>
      </div>
    </div>
  )
}
