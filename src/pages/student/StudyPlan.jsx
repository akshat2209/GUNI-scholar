import { useEffect, useState } from 'react'
import { Badge, Card, EmptyState, Loading, PageHeader } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import api from '../../lib/api'

export default function StudyPlan() {
  const toast = useToast()
  const [courses, setCourses] = useState([])
  const [activeCourseId, setActiveCourseId] = useState('')
  const [plan, setPlan] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        setLoading(true)
        const coursesRes = await api.get('/student/courses')
        const cList = coursesRes.courses || []
        setCourses(cList)
        if (cList.length > 0) {
          const firstId = cList[0].id
          setActiveCourseId(firstId)
          const planRes = await api.get(`/student/study-plan/${firstId}`)
          setPlan(planRes.plan)
          setTasks(planRes.tasks || [])
        }
      } catch (err) {
        console.error('Study plan load error:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const switchCourse = async (courseId) => {
    setActiveCourseId(courseId)
    try {
      setLoading(true)
      const planRes = await api.get(`/student/study-plan/${courseId}`)
      setPlan(planRes.plan)
      setTasks(planRes.tasks || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function toggle(task) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    const next = tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    setTasks(next)

    try {
      await api.patch(`/student/study-plan/tasks/${task.id}`, { status: newStatus })
      if (newStatus === 'completed') toast('Task marked complete. Progress updated.')
    } catch (err) {
      console.error('Failed to update task:', err)
    }
  }

  if (loading) return <Loading label="Generating smart study plan" />

  const done = tasks.filter((t) => t.status === 'completed').length
  const pct = tasks.length > 0 ? Math.round((100 * done) / tasks.length) : 0

  return (
    <div className="page">
      <PageHeader
        title="Smart Study Plan"
        sub="Generated from your weakest topics and the learning resources published by your faculty."
      />

      <div className="wrap-gap mb-16" role="navigation" aria-label="Switch course">
        {courses.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`btn btn-sm ${c.id === activeCourseId ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => switchCourse(c.id)}
          >
            {c.code} - {c.title}
          </button>
        ))}
      </div>

      <div className="grid grid-3">
        <Card title="Plan progress">
          <div className="flex-between mb-8">
            <span className="small muted">{done} of {tasks.length} tasks done</span>
            <span style={{ fontWeight: 800, fontSize: 22, fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
          </div>
          <div className={`progress ${pct === 100 ? 'ok' : ''}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Study plan completion">
            <span style={{ width: `${pct}%` }} />
          </div>
          <p className="small muted mt-16">Complete lesson reviews before practice problem tasks.</p>
        </Card>

        <Card title="Focus topics" sub="Topics needing reinforcement">
          <p className="small muted">Practice exercises and review modules are mapped to core syllabus units to reinforce conceptual mastery.</p>
        </Card>

        <Card title="Upcoming milestones" sub="Assessment alignment">
          <p className="small muted">Follow the recommended daily tasks to stay ahead of upcoming assessment deadlines.</p>
        </Card>
      </div>

      <Card title="Daily tasks" sub="Tick off tasks as you complete them.">
        {tasks.length === 0 ? (
          <EmptyState title="No tasks scheduled yet" />
        ) : (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tasks.map((t) => (
              <li key={t.id} className="card card-pad flex-between" style={{ boxShadow: 'none', background: 'var(--canvas)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <input
                    type="checkbox"
                    checked={t.status === 'completed'}
                    onChange={() => toggle(t)}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--red-600)' }}
                  />
                  <div>
                    <strong style={{ textDecoration: t.status === 'completed' ? 'line-through' : 'none', color: t.status === 'completed' ? 'var(--ink-400)' : 'var(--ink-900)' }}>
                      {t.title}
                    </strong>
                    <div className="small muted mt-2">Type: {t.task_type} · Topic: {t.topics?.title || 'Core'}</div>
                  </div>
                </div>
                <Badge tone={t.status === 'completed' ? 'ok' : 'neutral'}>
                  {t.status === 'completed' ? 'Done' : 'Pending'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
