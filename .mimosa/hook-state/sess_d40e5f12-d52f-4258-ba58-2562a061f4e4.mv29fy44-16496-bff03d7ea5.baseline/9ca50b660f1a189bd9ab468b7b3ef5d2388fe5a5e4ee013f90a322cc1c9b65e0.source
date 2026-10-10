import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FileText, Film, NotebookPen, PencilLine } from 'lucide-react'
import { Card, EmptyState, Field, Loading, PageHeader, Badge, Crumb } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import api from '../../lib/api'

const typeIcons = { notes: NotebookPen, slides: FileText, video: Film, practice: PencilLine, link: FileText }

function CourseManage({ courseId }) {
  const toast = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const [res, setRes] = useState({ title: '', topicId: '', type: 'notes', url: '' })
  const [resError, setResError] = useState('')
  const [resSubmitting, setResSubmitting] = useState(false)

  const [ann, setAnn] = useState({ title: '', body: '' })
  const [annErrors, setAnnErrors] = useState({})
  const [annSubmitting, setAnnSubmitting] = useState(false)

  const loadDetails = async () => {
    try {
      setLoading(true)
      const resData = await api.get(`/faculty/courses/${courseId}`)
      setData(resData)
    } catch (err) {
      console.error('Failed to load course details:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (courseId) loadDetails()
  }, [courseId])

  if (loading) return <Loading label="Loading course management" />
  if (!data || !data.course) return <EmptyState title="Course not found" />

  const { course, topics = [], resources = [], announcements = [], students = [] } = data

  async function upload(e) {
    e.preventDefault()
    if (!res.title.trim()) {
      setResError('Give the resource a title.')
      return
    }
    if (!res.topicId) {
      setResError('Pick the topic this resource belongs to.')
      return
    }
    setResSubmitting(true)
    setResError('')
    try {
      await api.post(`/faculty/courses/${courseId}/resources`, {
        topicId: res.topicId,
        title: res.title.trim(),
        type: res.type,
        url: res.url.trim() || undefined,
      })
      toast('Resource published to the course.')
      setRes({ title: '', topicId: '', type: 'notes', url: '' })
      await loadDetails()
    } catch (err) {
      setResError(err.message || 'Failed to upload resource')
    } finally {
      setResSubmitting(false)
    }
  }

  async function postAnnouncement(e) {
    e.preventDefault()
    const errs = {}
    if (ann.title.trim().length < 5) errs.title = 'Title must be at least 5 characters.'
    if (ann.body.trim().length < 10) errs.body = 'Write a descriptive message for students.'
    setAnnErrors(errs)
    if (Object.keys(errs).length) return

    setAnnSubmitting(true)
    try {
      await api.post(`/faculty/courses/${courseId}/announcements`, {
        title: ann.title.trim(),
        body: ann.body.trim(),
      })
      toast('Announcement posted to the course.')
      setAnn({ title: '', body: '' })
      await loadDetails()
    } catch (err) {
      setAnnErrors({ body: err.message || 'Failed to post announcement' })
    } finally {
      setAnnSubmitting(false)
    }
  }

  return (
    <div className="page">
      <Crumb to="/faculty/courses">Back to my courses</Crumb>
      <PageHeader
        title={`${course.code} - ${course.title}`}
        sub={`${course.departments?.name || 'Computer Applications'} · Semester ${course.semester || 1} · ${students.length} students enrolled`}
      />

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <Card title="Publish a learning resource" sub="Resources appear for students instantly, filterable by syllabus topic.">
          <form onSubmit={upload} noValidate>
            <Field label="Resource title" htmlFor="rtitle" error={resError && !res.title ? resError : ''}>
              <input
                id="rtitle"
                className="input"
                value={res.title}
                onChange={(e) => { setRes({ ...res, title: e.target.value }); setResError('') }}
                placeholder="e.g. Unit 3 - Tree Traversal Slides & Practice Problems"
              />
            </Field>
            <div className="form-row">
              <Field label="Topic" htmlFor="rtopic" error={resError && !res.topicId ? resError : ''}>
                <select id="rtopic" className="select" value={res.topicId} onChange={(e) => setRes({ ...res, topicId: e.target.value })}>
                  <option value="">Select topic</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </Field>
              <Field label="Type" htmlFor="rtype">
                <select id="rtype" className="select" value={res.type} onChange={(e) => setRes({ ...res, type: e.target.value })}>
                  <option value="notes">Lecture notes</option>
                  <option value="slides">Slides</option>
                  <option value="video">Video link</option>
                  <option value="practice">Practice set</option>
                  <option value="link">Web reference</option>
                </select>
              </Field>
            </div>
            <Field label="Resource link or URL (optional)" htmlFor="rurl">
              <input
                id="rurl"
                className="input"
                value={res.url}
                onChange={(e) => setRes({ ...res, url: e.target.value })}
                placeholder="https://..."
              />
            </Field>
            {resError && <p className="field-error mb-12">{resError}</p>}
            <button className="btn btn-primary mt-8" disabled={resSubmitting}>
              {resSubmitting ? 'Publishing...' : 'Publish resource'}
            </button>
          </form>
        </Card>

        <Card title="Post an announcement" sub="Students see this on the course page and their dashboard notifications.">
          <form onSubmit={postAnnouncement} noValidate>
            <Field label="Title" htmlFor="atitle" error={annErrors.title}>
              <input
                id="atitle"
                className="input"
                value={ann.title}
                onChange={(e) => setAnn({ ...ann, title: e.target.value })}
                placeholder="e.g. Lab schedule update for Friday"
              />
            </Field>
            <Field label="Message" htmlFor="abody" error={annErrors.body}>
              <textarea
                id="abody"
                className="textarea"
                rows={4}
                value={ann.body}
                onChange={(e) => setAnn({ ...ann, body: e.target.value })}
                placeholder="Details of the announcement..."
              />
            </Field>
            <button className="btn btn-primary mt-8" disabled={annSubmitting}>
              {annSubmitting ? 'Posting...' : 'Post announcement'}
            </button>
          </form>
        </Card>
      </div>

      <div className="grid grid-2" style={{ gridTemplateColumns: '1.6fr 1fr', alignItems: 'start' }}>
        <Card title={`Published material (${resources.length})`} tight>
          {resources.length === 0 ? (
            <EmptyState title="No material published yet">Publish the first lecture notes or slides using the form above.</EmptyState>
          ) : (
            <div className="table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="data" style={{ minWidth: 440 }}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Topic</th>
                    <th>Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((r) => {
                    const topic = topics.find((t) => t.id === r.topic_id)
                    const Icon = typeIcons[r.type] || FileText
                    return (
                      <tr key={r.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon size={16} className="muted" />
                            <strong>{r.title}</strong>
                          </div>
                        </td>
                        <td>{topic?.title || 'General'}</td>
                        <td><Badge tone="neutral">{r.type}</Badge></td>
                        <td>
                          {r.url ? (
                            <a href={r.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                              Open link
                            </a>
                          ) : (
                            <span className="small muted">Ready</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title={`Announcements (${announcements.length})`} tight>
          {announcements.length === 0 ? (
            <EmptyState title="No announcements">No notices posted for this course yet.</EmptyState>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, padding: '16px' }}>
              {announcements.map((a) => (
                <li key={a.id} className="card card-pad" style={{ boxShadow: 'none', background: 'var(--canvas)' }}>
                  <div className="flex-between">
                    <strong>{a.title}</strong>
                    <span className="small muted">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="small mt-8">{a.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title={`Enrolled students (${students.length})`} tight>
        {students.length === 0 ? (
          <EmptyState title="No students enrolled yet" />
        ) : (
          <div className="table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="data">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id}>
                    <td><Badge tone="neutral">{st.roll_no || 'N/A'}</Badge></td>
                    <td style={{ fontWeight: 600 }}>{st.full_name}</td>
                    <td>{st.email}</td>
                    <td>
                      <Link to={`/faculty/students/${st.id}`} className="btn btn-secondary btn-sm">
                        View Analytics →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default function FacultyCourses() {
  const { user } = useAuth()
  const { courseId } = useParams()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const loadCourses = async () => {
    try {
      setLoading(true)
      const res = await api.get('/faculty/courses')
      setCourses(res.courses || [])
    } catch (err) {
      console.error('Failed to load faculty courses:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!courseId) loadCourses()
  }, [courseId])

  if (courseId) return <CourseManage courseId={courseId} />
  if (loading) return <Loading label="Loading your taught courses" />

  return (
    <div className="page">
      <PageHeader
        title="My Taught Courses"
        sub="All active university courses assigned to you. Open any course to manage syllabus materials, post announcements, and view enrolled students."
      />

      {courses.length === 0 ? (
        <EmptyState title="No courses assigned">
          You are not currently assigned as faculty for any active courses. Please contact the department dean or administrator.
        </EmptyState>
      ) : (
        <div className="grid grid-3">
          {courses.map((c) => (
            <article key={c.id} className="card card-pad">
              <div className="flex-between">
                <span className="badge badge-brand">{c.code}</span>
                <span className="small muted">Semester {c.semester || 1}</span>
              </div>
              <h3 className="mt-8" style={{ fontSize: 16 }}>{c.title}</h3>
              <p className="small muted mt-8">{c.departments?.name || 'Department of Computer Science'}</p>
              <p className="small muted">Academic Year: {c.academic_year || '2025-26'}</p>
              <Link className="btn btn-secondary btn-sm mt-16" to={`/faculty/courses/${c.id}`}>
                Manage course →
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
