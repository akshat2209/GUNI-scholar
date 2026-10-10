import { useEffect, useState } from 'react'
import { Card, Field, Loading, PageHeader } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import api from '../../lib/api'

export default function AdminCourses() {
  const toast = useToast()
  const [courses, setCourses] = useState([])
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [coursesRes, usersRes] = await Promise.all([
        api.get('/courses'),
        api.get('/admin/users'),
      ])
      setCourses(coursesRes.courses || [])
      setFaculty((usersRes.users || []).filter((u) => u.role === 'faculty'))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function assignFaculty(courseId, facultyId) {
    try {
      await api.patch(`/admin/courses/${courseId}/faculty`, { facultyId })
      toast('Assigned faculty updated successfully.')
      loadData()
    } catch (err) {
      toast('Failed to update faculty assignment.')
    }
  }

  if (loading) return <Loading label="Loading courses & assignments" />

  return (
    <div className="page">
      <PageHeader
        title="Course Curriculum & Faculty Assignments"
        sub="Assign faculty members to university courses and manage curriculum instructors."
      />

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        {courses.map((c) => {
          return (
            <Card
              key={c.id}
              title={`${c.code} · ${c.title}`}
              sub={`${c.departments?.name || 'B.Tech CSE'} · Semester ${c.semester || 1}`}
            >
              <div className="form-row mt-8" style={{ alignItems: 'center' }}>
                <Field label="Assign Faculty Instructor" htmlFor={`fac-${c.id}`}>
                  <select
                    id={`fac-${c.id}`}
                    className="select"
                    value={c.faculty_id || ''}
                    onChange={(e) => assignFaculty(c.id, e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {faculty.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.email})
                      </option>
                    ))}
                  </select>
                </Field>
                <div style={{ paddingTop: 10 }}>
                  <span className="small muted" style={{ display: 'block', fontWeight: 600 }}>Currently Taught By</span>
                  <span style={{ fontSize: 14, color: 'var(--ink-900)' }}>
                    {c.profiles?.full_name ? `${c.profiles.full_name}` : 'Unassigned'}
                  </span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
