import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Card, Loading, PageHeader, StatCard } from '../../components/ui'
import api from '../../lib/api'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await api.get('/admin/overview')
        setData(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Loading label="Loading admin overview" />

  const byRole = data?.roleCounts || { student: 0, faculty: 0, dean: 0, admin: 0 }

  return (
    <div className="page">
      <PageHeader
        title="Platform Overview"
        sub="Accounts, roles, course structure and platform-level activity. Use the sections below for administration."
        actions={
          <>
            <Link to="/admin/users" className="btn btn-primary">Manage users</Link>
            <Link to="/admin/courses" className="btn btn-secondary">Manage courses</Link>
          </>
        }
      />

      <div className="grid grid-4">
        <StatCard label="User accounts" value={data?.totalUsers || 0} meta={`${byRole.student} students, ${byRole.faculty} faculty`} />
        <StatCard label="Active courses" value={data?.totalCourses || 0} meta="Academic courses" />
        <StatCard label="Enrollments" value={data?.totalEnrollments || 0} meta="Student-course pairs" />
        <StatCard label="Evaluations pending" value={data?.pendingEvaluations || 0} meta={data?.pendingEvaluations ? 'Faculty action needed' : 'All evaluated'} />
      </div>

      <div className="grid grid-2">
        <Card title="Accounts by role" tight>
          <ul style={{ listStyle: 'none' }}>
            {['student', 'faculty', 'dean', 'admin'].map((r) => (
              <li key={r} className="flex-between" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                  {({ student: 'Students', faculty: 'Faculty', dean: 'Deans', admin: 'Admins' })[r]}
                </span>
                <Badge tone={r}>
                  {byRole[r] || 0} {r} accounts
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Administrative Actions" sub="Quick management shortcuts">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Link to="/admin/users" className="btn btn-secondary btn-block" style={{ justifyContent: 'flex-start', padding: '14px 18px', height: 'auto' }}>
              <div>
                <strong style={{ display: 'block', fontSize: 14.5 }}>View & Manage User Roles</strong>
                <span className="small muted">Change permissions, promote faculty, deans, or administrators.</span>
              </div>
            </Link>
            <Link to="/admin/courses" className="btn btn-secondary btn-block" style={{ justifyContent: 'flex-start', padding: '14px 18px', height: 'auto' }}>
              <div>
                <strong style={{ display: 'block', fontSize: 14.5 }}>Assign Faculty & Course Curriculum</strong>
                <span className="small muted">Update course assignments, semesters, and teaching faculty.</span>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
