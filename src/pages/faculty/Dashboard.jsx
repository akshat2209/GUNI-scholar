import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { Badge, Card, EmptyState, Loading, PageHeader, StatCard, riskTone } from '../../components/ui'
import { EngagementArea } from '../../components/charts'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'

export default function FacultyDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [heatmapData, setHeatmapData] = useState(null)
  const [loadingHeatmap, setLoadingHeatmap] = useState(false)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        const res = await api.get('/faculty/dashboard')
        setData(res)
        if (res.courses && res.courses.length > 0) {
          setSelectedCourseId(res.courses[0].id)
        }
      } catch (err) {
        console.error('Failed to load faculty dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) loadDashboard()
  }, [user?.id])

  useEffect(() => {
    async function loadHeatmap() {
      if (!selectedCourseId) return
      try {
        setLoadingHeatmap(true)
        const res = await api.get(`/faculty/heatmap/${selectedCourseId}`)
        setHeatmapData(res)
      } catch (err) {
        console.error('Failed to load course heatmap:', err)
      } finally {
        setLoadingHeatmap(false)
      }
    }
    loadHeatmap()
  }, [selectedCourseId])

  if (loading) return <Loading label="Loading faculty dashboard" />

  const courses = data?.courses || []
  const courseRows = data?.courseRows || []
  const atRiskStudents = data?.atRiskStudents || []
  const pendingEval = data?.pendingEvaluationsCount || 0

  const supportStudents = atRiskStudents.filter((s) => s.risk_level === 'high' || s.risk_level === 'medium' || (s.risk_score && s.risk_score >= 30))
  const displayStudents = atRiskStudents.slice(0, 8)
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0]

  return (
    <div className="page">
      <PageHeader
        title="Faculty Dashboard"
        sub={`Teaching overview for ${user?.name || 'Faculty'}. Risk alerts are explainable: open a student to inspect exact indicators behind their score.`}
        actions={<Link to="/faculty/heatmap" className="btn btn-primary">Open confusion heatmap</Link>}
      />

      <div className="grid grid-4">
        <StatCard label="Courses taught" value={courses.length} meta={courses.map((c) => c.code).join(', ') || 'Active courses'} />
        <StatCard label="Students enrolled" value={courseRows.reduce((s, r) => s + (r.studentCount || 0), 0)} meta="Across all your courses" />
        <StatCard label="Submissions to evaluate" value={pendingEval} meta={pendingEval ? 'Evaluation pending' : 'All caught up'} />
        <StatCard label="Students needing support" value={supportStudents.length} meta={`${supportStudents.filter((s) => s.risk_level === 'high').length} high, ${supportStudents.filter((s) => s.risk_level === 'medium').length} medium risk`} />
      </div>

      <div className="grid grid-2">
        <Card title="Explainable academic risk alerts" sub="Students in your courses ranked by risk score, with contributing indicators.">
          {displayStudents.length === 0 ? (
            <EmptyState title="No risk alerts">No student in your courses is currently in the medium or high risk band.</EmptyState>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {displayStudents.map((s) => {
                const band = s.risk_level ? s.risk_level.charAt(0).toUpperCase() + s.risk_level.slice(1) : (s.risk_score >= 60 ? 'High' : s.risk_score >= 30 ? 'Medium' : 'Low')
                const indicators = Array.isArray(s.indicators) ? s.indicators : []
                return (
                  <li
                    key={`${s.student_id}-${s.course_id}`}
                    className="card card-pad"
                    style={{
                      boxShadow: 'none',
                      background: 'var(--canvas)',
                      borderLeft: `3px solid ${band === 'High' ? 'var(--bad-text)' : band === 'Medium' ? 'var(--warn-text)' : 'var(--ok-text)'}`,
                    }}
                  >
                    <div className="flex-between">
                      <div>
                        <strong>{s.full_name}</strong> <span className="small muted">({s.roll_no || 'N/A'}, {s.course_code})</span>
                      </div>
                      <Badge tone={riskTone(band)}>{band} risk · {s.risk_score || 0}/100</Badge>
                    </div>

                    <ul className="risk-list" style={{ marginTop: 8 }}>
                      {indicators.slice(0, 2).map((i, idx) => (
                        <li key={idx}>
                          <AlertTriangle size={15} color="var(--warn-text)" aria-hidden="true" />
                          <span className="small">
                            <strong>{i.indicator || i.label || 'Indicator'}:</strong> {i.detail || i.evidence || (typeof i === 'string' ? i : '')}
                          </span>
                        </li>
                      ))}
                      {indicators.length === 0 && (
                        <li className="small muted">Score based on continuous quiz and submission indicators.</li>
                      )}
                    </ul>

                    <div className="flex-between mt-16">
                      <span className="small muted">Assessment average: {Math.round(s.avg_quiz_score || 0)}%</span>
                      <Link className="btn btn-secondary btn-sm" to={`/faculty/students/${s.student_id}`}>
                        View details & interventions <ChevronRight size={13} aria-hidden="true" />
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card title="Courses and evaluation status" tight>
            <div className="table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="data" style={{ minWidth: 440 }}>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th className="num">Students</th>
                    <th className="num">Assignments</th>
                    <th className="num">To evaluate</th>
                  </tr>
                </thead>
                <tbody>
                  {courseRows.map((r) => (
                    <tr key={r.course.id}>
                      <td>
                        <Link to={`/faculty/courses/${r.course.id}`} style={{ fontWeight: 600 }}>
                          {r.course.code} - {r.course.title}
                        </Link>
                      </td>
                      <td className="num">{r.studentCount}</td>
                      <td className="num">{r.assignmentCount}</td>
                      <td className="num">
                        {r.pendingEvaluations ? <Badge tone="warn">{r.pendingEvaluations}</Badge> : <Badge tone="ok">0</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card
            title="Topic-wise class performance"
            sub={selectedCourse ? `Average incorrect rate across quizzes in ${selectedCourse.code}. High bars are teaching priorities.` : 'Topic performance'}
          >
            {courses.length > 1 && (
              <div className="wrap-gap mb-12">
                {courses.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`btn btn-sm ${c.id === selectedCourseId ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedCourseId(c.id)}
                  >
                    {c.code}
                  </button>
                ))}
              </div>
            )}
            {loadingHeatmap ? (
              <Loading label="Analyzing class topic responses" />
            ) : (
              <ClassTopicPerformance rows={heatmapData?.rows || []} />
            )}
          </Card>
        </div>
      </div>

      <Card title="Recommended interventions" sub="Actions suggested by the academic risk model for students needing support.">
        <div className="grid grid-3">
          {displayStudents.slice(0, 3).map((s) => {
            const band = s.risk_level ? s.risk_level.charAt(0).toUpperCase() + s.risk_level.slice(1) : 'Low'
            return (
              <div key={s.student_id + s.course_id} className="card card-pad" style={{ boxShadow: 'none', background: 'var(--canvas)' }}>
                <Badge tone={riskTone(band)}>{s.full_name} ({s.course_code})</Badge>
                <h3 className="mt-8" style={{ fontSize: 15 }}>
                  {s.late_submissions > 0 ? 'Submission discipline check' : 'Conceptual reinforcement'}
                </h3>
                <p className="small muted mt-8">
                  {band === 'High'
                    ? 'Schedule a one-on-one tutorial session and review the upcoming assessment requirements.'
                    : 'Share recommended topic practice sets and monitor progress on the next evaluation.'}
                </p>
                <div className="mt-12">
                  <Link to={`/faculty/students/${s.student_id}`} className="small" style={{ fontWeight: 600 }}>
                    Open student profile →
                  </Link>
                </div>
              </div>
            )
          })}
          {displayStudents.length === 0 && <p className="muted small">No interventions needed right now.</p>}
        </div>
      </Card>

      <Card title="Class engagement snapshot" sub="Weekly resource access activity across your enrolled students.">
        <EngagementArea weeks={['W3', 'W4', 'W5', 'W6', 'W7', 'W8']} views={[95, 88, 74, 61, 55, 68]} color="#c41e24" />
      </Card>
    </div>
  )
}

function ClassTopicPerformance({ rows }) {
  if (!rows || rows.length === 0) {
    return <p className="small muted">No evaluated quiz data recorded for this course yet.</p>
  }

  const sorted = [...rows].sort((a, b) => (b.avgIncorrectPct || 0) - (a.avgIncorrectPct || 0)).slice(0, 6)

  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {sorted.map((r) => {
        const pct = r.avgIncorrectPct != null ? r.avgIncorrectPct : 25
        const title = r.topic.title || r.topic.name || 'Topic'
        return (
          <li key={r.topic.id} className="mastery-row">
            <span className="t" title={title}>
              {title}
            </span>
            <div className="progress bad" role="img" aria-label={`${title}: ${pct}% incorrect`}>
              <span style={{ width: `${pct}%`, background: pct >= 50 ? 'var(--bad-text)' : pct >= 30 ? 'var(--warn-text)' : 'var(--ok-text)' }} />
            </div>
            <span className="v" style={{ fontWeight: 600, color: pct >= 50 ? 'var(--bad-text)' : 'inherit' }}>
              {pct}% err
            </span>
          </li>
        )
      })}
    </ul>
  )
}
