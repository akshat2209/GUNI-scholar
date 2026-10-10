import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, EmptyState, Field, PageHeader, Badge, Loading } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import api from '../../lib/api'

export default function FacultyAssignments() {
  const { user } = useAuth()
  const toast = useToast()

  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    courseId: '',
    title: '',
    due: '',
    maxMarks: 20,
    description: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [coursesRes, asgsRes] = await Promise.all([
        api.get('/faculty/courses'),
        api.get('/faculty/assignments'),
      ])
      const cList = coursesRes.courses || []
      setCourses(cList)
      setAssignments(asgsRes.assignments || [])
      if (cList.length > 0 && !form.courseId) {
        setForm((f) => ({ ...f, courseId: cList[0].id }))
      }
    } catch (err) {
      console.error('Failed to load assignments data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) loadData()
  }, [user?.id])

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.courseId) errs.courseId = 'Select a course.'
    if (form.title.trim().length < 5) errs.title = 'Title must be at least 5 characters.'
    if (!form.due) errs.due = 'Select a submission deadline.'
    if (form.description.trim().length < 15) errs.description = 'Provide clear assignment instructions (min 15 chars).'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      await api.post(`/faculty/courses/${form.courseId}/assignments`, {
        title: form.title.trim(),
        instructions: form.description.trim(),
        maxMarks: Number(form.maxMarks) || 20,
        dueAt: new Date(form.due).toISOString(),
      })
      toast(`Assignment "${form.title}" published successfully!`)
      setForm({
        courseId: courses[0]?.id || '',
        title: '',
        due: '',
        maxMarks: 20,
        description: '',
      })
      await loadData()
    } catch (err) {
      setErrors({ description: err.message || 'Failed to create assignment' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loading label="Loading assignments and courses" />

  return (
    <div className="page">
      <PageHeader
        title="Assignments Management"
        sub="Publish course assignments with deadlines, track student submissions, and manage evaluation progress."
      />

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <Card title="Create and publish an assignment">
          <form onSubmit={submit} noValidate>
            <Field label="Course" htmlFor="fcourse" error={errors.courseId}>
              <select
                id="fcourse"
                className="select"
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                aria-invalid={!!errors.courseId}
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.title}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Assignment Title" htmlFor="ftitle" error={errors.title}>
              <input
                id="ftitle"
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                aria-invalid={!!errors.title}
                placeholder="e.g. Lab 4 — Recursive Algorithms & Binary Trees"
              />
            </Field>

            <div className="form-row">
              <Field label="Submission Deadline" htmlFor="fdue" error={errors.due}>
                <input
                  id="fdue"
                  type="date"
                  className="input"
                  value={form.due}
                  onChange={(e) => setForm({ ...form, due: e.target.value })}
                  aria-invalid={!!errors.due}
                />
              </Field>
              <Field label="Maximum Marks" htmlFor="fmarks">
                <input
                  id="fmarks"
                  className="input"
                  type="number"
                  min="5"
                  max="100"
                  value={form.maxMarks}
                  onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Instructions & Requirements" htmlFor="fdesc" error={errors.description}>
              <textarea
                id="fdesc"
                className="textarea"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                aria-invalid={!!errors.description}
                placeholder="Specify requirements, file formats (PDF/ZIP), and evaluation criteria..."
              />
            </Field>

            <button className="btn btn-primary mt-8" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish assignment'}
            </button>
          </form>
        </Card>

        <Card title={`Published assignments (${assignments.length})`} tight>
          {assignments.length === 0 ? (
            <EmptyState title="No assignments yet">
              Publish your first assignment using the form on the left.
            </EmptyState>
          ) : (
            <div className="table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="data" style={{ minWidth: 440 }}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Course</th>
                    <th>Deadline</th>
                    <th>Submissions</th>
                    <th>Evaluation</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.title}</td>
                      <td>{a.courses?.code || 'Course'}</td>
                      <td>{new Date(a.due_at).toLocaleDateString()}</td>
                      <td className="num">{a.totalSubmissions || 0}</td>
                      <td>
                        {a.pendingEvaluations > 0 ? (
                          <Badge tone="warn">{a.pendingEvaluations} pending</Badge>
                        ) : a.totalSubmissions > 0 ? (
                          <Badge tone="ok">All evaluated</Badge>
                        ) : (
                          <Badge tone="neutral">0 turned in</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="card-body-tight">
            <Link to="/faculty/evaluation" className="btn btn-secondary btn-sm">
              Open evaluation queue →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
