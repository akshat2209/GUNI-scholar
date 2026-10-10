import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { Badge, Card, EmptyState, Loading, MasteryRow, PageHeader, StatCard, riskTone } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { getStudentDashboardData, getStudentAnalyticsData } from '../../lib/adapters'
import api from '../../lib/api'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [activeCourse, setActiveCourse] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [upcomingAssignments, setUpcomingAssignments] = useState([])

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        const data = await getStudentDashboardData(user.id)
        const cList = (data.courses || []).map((c) => ({
          ...c,
          short: c.code,
        }))
        setCourses(cList)
        setUpcomingAssignments(data.upcomingAssignments || [])

        const selectedCourseId = params.get('course')
        const active = cList.find((c) => c.id === selectedCourseId) || cList[0] || null
        setActiveCourse(active)

        if (active) {
          const analyticsData = await getStudentAnalyticsData(user.id, active.id)
          setAnalytics(analyticsData)
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      loadDashboard()
    }
  }, [user?.id, params])

  if (loading || !activeCourse) {
    if (!loading && courses.length === 0) {
      return (
        <div className="page">
          <PageHeader
            title={`Welcome back, ${user?.name || 'Student'}`}
            sub="You are not enrolled in any courses yet."
          />
          <EmptyState title="No enrolled courses">
            Please contact your administrator to enroll in your semester courses.
          </EmptyState>
        </div>
      )
    }
    return <Loading label="Loading your dashboard" />
  }

  const risk = analytics?.risk || {
    risk_score: 15,
    risk_level: 'low',
    indicators: [],
  }
  const band = (risk.risk_level || 'Low').charAt(0).toUpperCase() + (risk.risk_level || 'low').slice(1)
  const topics = analytics?.topics || []
  const recommendations = analytics?.recommendations || []

  return (
    <div className="page">
      <PageHeader
        title={`Welcome back, ${user?.name || 'Student'}`}
        sub={`Semester ${user?.sem || 1} progress across enrolled courses. Analytics shown for ${activeCourse.code} · ${activeCourse.title}.`}
      />

      <div className="wrap-gap" role="navigation" aria-label="Switch course for summary panels">
        {courses.map((c) => (
          <Link
            key={c.id}
            to={`/student?course=${c.id}`}
            className={`btn btn-sm ${c.id === activeCourse.id ? 'btn-primary' : 'btn-secondary'}`}
            aria-current={c.id === activeCourse.id ? 'true' : undefined}
          >
            {c.short} - {c.title}
          </Link>
        ))}
      </div>

      <div className="grid grid-4">
        <StatCard
          label="Courses enrolled"
          value={courses.length}
          meta={user?.department?.name || user?.dept || 'B.Tech CSE'}
        />
        <StatCard
          label="Assessment average"
          value={`${Math.round(risk.avg_quiz_score || 75)}%`}
          meta={`${activeCourse.short} evaluated quizzes`}
        />
        <StatCard
          label="Late submissions"
          value={risk.late_submissions || 0}
          meta={risk.late_submissions >= 2 ? 'Needs attention' : 'In a row'}
        />
        <StatCard
          label="Pending deadlines"
          value={upcomingAssignments.length}
          meta={upcomingAssignments[0] ? `${upcomingAssignments[0].title}` : 'Nothing due right now'}
        />
      </div>

      <div className="grid grid-2">
        <Card title="Academic risk indicators" actions={<Badge tone={riskTone(band)}>{band} risk</Badge>}>
          <div className="risk-score">
            <span
              className="big"
              style={{
                color: band === 'High' ? 'var(--bad-text)' : band === 'Medium' ? 'var(--warn-text)' : 'var(--ok-text)',
              }}
            >
              {risk.risk_score || 0}
            </span>
            <p className="small muted" style={{ flex: 1, minWidth: 200 }}>
              Your risk score is computed from explainable continuous indicators. Each indicator below contributes to this assessment.
            </p>
          </div>
          {!risk.indicators || risk.indicators.length === 0 ? (
            <EmptyState title="No risk indicators active">
              All monitored indicators are within healthy ranges. Keep it up!
            </EmptyState>
          ) : (
            <ul className="risk-list">
              {risk.indicators.map((i, idx) => (
                <li key={idx}>
                  <AlertTriangle size={17} color="var(--warn-text)" aria-hidden="true" />
                  <span><strong>{typeof i === 'string' ? i : i.label || i.indicator}</strong></span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title={`Topic mastery in ${activeCourse.short}`}
          actions={
            <Link className="btn btn-secondary btn-sm" to={`/student/analytics/${activeCourse.id}`}>
              Full analytics <ChevronRight size={14} aria-hidden="true" />
            </Link>
          }
        >
          {topics.length === 0 ? (
            <EmptyState title="No topics yet" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {topics.map((m) => (
                <MasteryRow key={m.id} name={m.title} value={m.mastery || 75} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card
        title="Personalised recommendations"
        sub="Generated from your weakest topics and the resources your faculty has published."
      >
        {recommendations.length === 0 ? (
          <EmptyState title="No recommendations right now">
            Your topic mastery is above the recommendation threshold across this course.
          </EmptyState>
        ) : (
          <div className="grid grid-3">
            {recommendations.map((r) => (
              <div key={r.topic.id} className="card card-pad" style={{ boxShadow: 'none', background: 'var(--canvas)' }}>
                <Badge tone={r.mastery < 40 ? 'bad' : 'warn'}>{r.mastery}% mastery</Badge>
                <h3 className="mt-8">{r.topic.title}</h3>
                <p className="small muted mt-8">{r.reason}</p>
                <ul style={{ listStyle: 'none', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(r.resources || []).map((res) => (
                    <li key={res.id}>
                      <Link to={`/student/courses/${activeCourse.id}`} className="small" style={{ fontWeight: 600 }}>
                        {res.title}
                      </Link>
                      <span className="small muted"> ({res.type})</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
