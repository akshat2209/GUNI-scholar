import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Download, FileText, Film, NotebookPen, PencilLine } from 'lucide-react'
import { Card, EmptyState, Loading, PageHeader, Crumb } from '../../components/ui'
import api from '../../lib/api'

const typeIcon = { notes: NotebookPen, slides: FileText, video: Film, practice: PencilLine }

export function CourseCardGrid({ courses, detailBase }) {
  return (
    <div className="grid grid-3">
      {courses.map((c) => {
        return (
          <article key={c.id} className="card card-pad">
            <div className="flex-between">
              <span className="badge badge-brand">{c.code}</span>
              <span className="small muted">4 credits</span>
            </div>
            <h3 className="mt-8" style={{ fontSize: 16 }}>{c.title}</h3>
            <p className="small muted mt-8">{c.departments?.name || 'B.Tech CSE'} · Semester {c.semester || 1}</p>
            <p className="small muted">Faculty: {c.profiles?.full_name || 'Prof. Faculty'}</p>
            <Link className="btn btn-secondary btn-sm mt-16" to={`${detailBase}/${c.id}`}>Open course</Link>
          </article>
        )
      })}
    </div>
  )
}

function CourseDetail({ courseId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [topicFilter, setTopicFilter] = useState('all')

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true)
        const res = await api.get(`/student/courses/${courseId}`)
        setData(res)
      } catch (err) {
        console.error('Failed to load course details:', err)
      } finally {
        setLoading(false)
      }
    }
    if (courseId) loadDetail()
  }, [courseId])

  if (loading) return <Loading label="Loading course materials" />
  if (!data || !data.course) return <EmptyState title="Course not found">This course does not exist or you are not enrolled in it.</EmptyState>

  const { course, topics = [], resources = [], announcements = [] } = data
  const shown = topicFilter === 'all' ? resources : resources.filter((r) => r.topic_id === topicFilter)
  const faculty = course.profiles

  return (
    <div className="page">
      <Crumb to="/student/courses">Back to all courses</Crumb>
      <PageHeader
        title={course.title}
        sub={`${course.code} · 4 credits · ${course.departments?.name || 'B.Tech CSE'}, semester ${course.semester || 1}. Taught by ${faculty?.full_name || 'Faculty'} (${faculty?.email || ''}).`}
      />

      <div className="grid grid-2" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
        <Card title="Study material by topic" sub="Filter by topic to find resources for exactly what you are studying.">
          <div className="filter-bar mb-16">
            <div className="field">
              <label htmlFor="topicFilter">Filter by topic</label>
              <select id="topicFilter" className="select" value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)}>
                <option value="all">All topics</option>
                {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
          </div>
          {shown.length === 0 ? (
            <EmptyState title="No material here yet">Resources for this filter have not been published yet.</EmptyState>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {shown.map((r) => {
                const Icon = typeIcon[r.type] || FileText
                return (
                  <li key={r.id} className="res-row">
                    <span className="res-icon"><Icon size={17} aria-hidden="true" /></span>
                    <div style={{ flex: 1 }}>
                      <strong>{r.title}</strong>
                      <div className="small muted">
                        Topic: {topics.find((t) => t.id === r.topic_id)?.title || 'General'} · Type: {r.type}
                      </div>
                    </div>
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                        <Download size={13} aria-hidden="true" /> Open resource
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card title="Announcements" sub="Posted by your course faculty.">
            {announcements.length === 0 ? (
              <EmptyState title="No announcements">No announcements have been posted for this course.</EmptyState>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
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
      </div>
    </div>
  )
}

export default function StudentCourses() {
  const { courseId } = useParams()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true)
        const data = await api.get('/student/courses')
        setCourses(data.courses || [])
      } catch (err) {
        console.error('Failed to load courses:', err)
      } finally {
        setLoading(false)
      }
    }
    if (!courseId) loadCourses()
  }, [courseId])

  if (courseId) return <CourseDetail courseId={courseId} />
  if (loading) return <Loading label="Loading your courses" />

  return (
    <div className="page">
      <PageHeader
        title="My Courses"
        sub="All courses enrolled for this academic semester. Open any course to access study materials, lecture slides, and practice sets."
      />
      {courses.length === 0 ? (
        <EmptyState title="No enrolled courses">You are not enrolled in any courses right now.</EmptyState>
      ) : (
        <CourseCardGrid courses={courses} detailBase="/student/courses" />
      )}
    </div>
  )
}
