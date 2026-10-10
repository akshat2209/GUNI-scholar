import { useEffect, useState } from 'react'
import { Card, Field, Loading, PageHeader, Badge } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import api from '../../lib/api'

export default function AdminUsers() {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/users')
      setUsers(res.users || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function changeRole(user, newRole) {
    try {
      await api.patch(`/admin/users/${user.id}/role`, { role: newRole })
      toast(`${user.full_name || user.email} now has ${newRole} access.`)
      loadUsers()
    } catch (err) {
      toast('Failed to update role.')
    }
  }

  const rows = users.filter((u) => {
    const matchesRole = role === 'all' || u.role === role
    const q = query.toLowerCase()
    const matchesQuery =
      !q ||
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.roll_no || '').toLowerCase().includes(q)
    return matchesRole && matchesQuery
  })

  return (
    <div className="page">
      <PageHeader
        title="Users and Roles"
        sub="Manage student, faculty, dean and admin accounts directly from the university platform database."
      />

      <div className="filter-bar">
        <div className="field" style={{ flex: 1, maxWidth: 320 }}>
          <label htmlFor="uq">Search accounts</label>
          <input
            id="uq"
            className="input"
            placeholder="Name, email or roll number..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="urole">Filter by role</label>
          <select id="urole" className="select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="all">All roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
            <option value="dean">Deans</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loading label="Loading users" />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>User Full Name</th>
                <th>Email Address</th>
                <th>Department</th>
                <th>Current Role</th>
                <th>Role Assignment</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>
                    {u.full_name}
                    {u.roll_no && <span className="muted small"> ({u.roll_no})</span>}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.departments?.name || u.departments?.code || 'General / CSE'}</td>
                  <td>
                    <Badge tone={u.role}>{u.role}</Badge>
                  </td>
                  <td>
                    <select
                      className="select"
                      style={{ minWidth: 120, minHeight: 34, padding: '4px 10px', fontSize: 13 }}
                      value={u.role}
                      aria-label={`Role for ${u.full_name}`}
                      onChange={(e) => changeRole(u, e.target.value)}
                    >
                      <option value="student">student</option>
                      <option value="faculty">faculty</option>
                      <option value="dean">dean</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
