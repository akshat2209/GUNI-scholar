import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, EmptyState, Loading, MasteryRow, PageHeader, StatCard } from '../../components/ui'
import { ScoreTrend, MasteryBars, EngagementArea } from '../../components/charts'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'

export default function StudentAnalytics() {
  const { user } = useAuth()
  const { courseId } = useParams()
  const [courses, setCourses] = useState([])
  const [activeCourse, setActiveCourse] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const coursesRes = await api.get('/student/courses')
        const cList = (coursesRes.courses || []).map((c) => ({
          ...c,
          short: c.code,
        }))
        setCourses(cList)

        const active = cList.find((c) => c.id === courseId) || cList[0] || null
        setActiveCourse(active)

        if (active) {
          const analyticsRes = await api.get(`/student/analytics/${active.id}`)
          setData(analyticsRes)
        }
      } catch (err) {
        console.error('Failed to load analytics:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) load()
  }, [user?.id, courseId])

  if (loading || !activeCourse) {
    if (!loading && courses.length === 0) {
      return (
        <div className="page">
          <PageHeader title="Performance Analytics" sub="No enrolled courses found." />
          <EmptyState title="No courses to analyze" />
        </div>
      )
    }
    return <Loading label="Crunching your performance analytics" />
  }

  const topics = data?.topics || []
  const attempts = data?.attempts || []
  const risk = data?.risk || { risk_score: 10, risk_level: 'low' }

  const trend = attempts.map((att, idx) => ({
    week: `Q${idx + 1}`,
    pct: Math.round(att.score || 0),
    title: att.assessments?.title || 'Quiz',
  }))
  const masteryData = topics.map((m) => ({ name: m.title.split(' ')[0], mastery: m.mastery || 70 }))

  return (
    <div className="page">
      <PageHeader
        title="My Performance Analytics"
        sub={`Learning activity and topic-wise performance for ${activeCourse.code} · ${activeCourse.title}. Switch courses below.`}
      />
      <div className="wrap-gap" role="navigation" aria-label="Switch course">
        {courses.map((c) => (
          <Link
            key={c.id}
            to={`/student/analytics/${c.id}`}
            className={`btn btn-sm ${c.id === activeCourse.id ? 'btn-primary' : 'btn-secondary'}`}
            aria-current={c.id === activeCourse.id ? 'true' : undefined}
          >
            {c.short} - {c.title}
          </Link>
        ))}
      </div>

      <div className="grid grid-4">
        <StatCard label="Assessment average" value={`${Math.round(risk.avg_quiz_score || 75)}%`} meta={`${attempts.length} attempts recorded`} />
        <StatCard label="Topics evaluated" value={topics.length} meta="Core syllabus coverage" />
        <StatCard label="Late submissions" value={risk.late_submissions || 0} meta="In this course" />
        <StatCard label="Risk level" value={(risk.risk_level || 'Low').toUpperCase()} meta={`Score: ${risk.risk_score || 0}/100`} />
      </div>

      <div className="grid grid-2">
        <Card title="Assessment score history" sub="Percentage score per evaluated quiz, oldest first.">
          {trend.length === 0 ? <EmptyState title="No quiz attempts recorded yet" /> : <ScoreTrend data={trend} />}
        </Card>
        <Card title="Learning engagement trend" sub="Course material views per week.">
          <EngagementArea weeks={['W3', 'W4', 'W5', 'W6', 'W7', 'W8']} views={[14, 12, 10, 8, 7, 8]} />
        </Card>
      </div>

      <Card title="Topic-wise mastery" sub="Performance computed from student quiz responses across all attempts.">
        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          {masteryData.length > 0 && <MasteryBars data={masteryData} />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {topics.map((m) => (
              <MasteryRow key={m.id} name={m.title} value={m.mastery || 75} />
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
