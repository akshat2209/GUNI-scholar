import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Badge, Card, EmptyState, Loading, MasteryRow, PageHeader, riskTone, Crumb } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'

function StudentDetail({ studentId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStudentDetail() {
      try {
        setLoading(true)
        const res = await api.get(`/faculty/students/${studentId}`)
        setData(res)
      } catch (err) {
        console.error('Failed to load student details:', err)
      } finally {
        setLoading(false)
      }
    }
    if (studentId) loadStudentDetail()
  }, [studentId])

  if (loading) return <Loading label="Loading student analytics profile" />
  if (!data || !data.student) return <EmptyState title="Student not found" />

  const { student, riskProfiles = [], mastery = [], submissions = [], attempts = [] } = data

  return (
    <div className="page">
      <Crumb to="/faculty/students">Back to students list</Crumb>
      <PageHeader
        title={student.full_name}
        sub={`${student.roll_no || 'No roll no'} · ${student.departments?.name || 'Department'} · ${student.email}`}
      />

      {riskProfiles.map((rp) => {
        const band = rp.risk_level ? rp.risk_level.charAt(0).toUpperCase() + rp.risk_level.slice(1) : (rp.risk_score >= 60 ? 'High' : rp.risk_score >= 30 ? 'Medium' : 'Low')
        const indicators = Array.isArray(rp.indicators) ? rp.indicators : []
        const courseMastery = mastery.filter((m) => m.topics?.course_id === rp.course_id || !m.topics?.course_id)
        const courseAttempts = attempts.filter((att) => att.assessments?.course_id === rp.course_id)

        return (
          <Card
            key={rp.course_id}
            title={`${rp.course_code || 'Course'} - ${rp.course_title || 'Course Details'}`}
            actions={<Badge tone={riskTone(band)}>Risk: {rp.risk_score || 0}/100 · {band}</Badge>}
          >
            <div className="grid grid-2" style={{ alignItems: 'start' }}>
              <div>
                <h3 className="mb-8">Explainable Risk Indicators</h3>
                <ul className="risk-list">
                  {indicators.map((i, idx) => (
                    <li key={idx}>
                      <AlertTriangle size={16} color="var(--warn-text)" aria-hidden="true" />
                      <span>
                        <strong>{i.indicator || i.label || 'Indicator'} (+{i.weight || i.points || 15} pts):</strong>{' '}
                        {i.detail || i.evidence || (typeof i === 'string' ? i : '')}
                      </span>
                    </li>
                  ))}
                  {indicators.length === 0 && <li>No active risk indicators in this course.</li>}
                </ul>

                <h3 className="mt-24 mb-8">Suggested Intervention</h3>
                <p className="small muted">
                  {band === 'High'
                    ? 'Schedule a 1-on-1 tutoring session. Review previous submission mistakes and assign targeted micro-practice sets before the upcoming assessment.'
                    : band === 'Medium'
                      ? 'Share recommended topic study notes and verify that pending assignment questions are understood.'
                      : 'Progress is healthy. Keep monitoring through regular weekly quizzes.'}
                </p>

                <h3 className="mt-24 mb-8">Submissions & Deadlines</h3>
                <p className="small muted">
                  {rp.late_submissions > 0 ? `${rp.late_submissions} late submission(s) recorded.` : 'All assignments submitted on time.'}{' '}
                  {rp.pending_submissions > 0 && `${rp.pending_submissions} pending assignment(s).`}
                </p>
              </div>

              <div>
                <h3 className="mb-8">Topic Mastery Breakdown</h3>
                {courseMastery.length === 0 ? (
                  <p className="small muted">No topic mastery data recorded for this course.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {courseMastery.map((m) => (
                      <MasteryRow
                        key={m.id || m.topic_id}
                        name={m.topics?.title || 'Topic'}
                        value={m.mastery_score != null ? m.mastery_score : 70}
                      />
                    ))}
                  </div>
                )}

                <h3 className="mt-20 mb-8">Recent Quiz Attempts</h3>
                {courseAttempts.length === 0 ? (
                  <p className="small muted">No quizzes attempted in this course.</p>
                ) : (
                  <div className="wrap-gap">
                    {courseAttempts.map((att) => (
                      <Badge key={att.id} tone="neutral">
                        {att.assessments?.title}: {Math.round(att.score || 0)}%
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )
      })}

      {riskProfiles.length === 0 && (
        <Card title="Course Information">
          <EmptyState title="Not enrolled in your courses">
            This student is not enrolled in any course currently assigned to you.
          </EmptyState>
        </Card>
      )}
    </div>
  )
}

export default function FacultyStudents() {
  const { user } = useAuth()
  const { studentId } = useParams()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')

  const loadStudents = async () => {
    try {
      setLoading(true)
      const res = await api.get('/faculty/students')
      setStudents(res.students || [])
    } catch (err) {
      console.error('Failed to load students:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!studentId && user?.id) loadStudents()
  }, [studentId, user?.id])

  if (studentId) return <StudentDetail studentId={studentId} />
  if (loading) return <Loading label="Loading enrolled students list" />

  const filtered = students.filter((s) => {
    const band = s.risk.band.toLowerCase()
    const matchesRisk = riskFilter === 'all' || band === riskFilter.toLowerCase()
    const q = query.toLowerCase()
    const matchesQuery =
      !q ||
      s.student.name.toLowerCase().includes(q) ||
      (s.student.rollNo || '').toLowerCase().includes(q) ||
      (s.course.code || '').toLowerCase().includes(q)
    return matchesRisk && matchesQuery
  })

  return (
    <div className="page">
      <PageHeader
        title="Students Roster"
        sub="All students enrolled in your courses with their explainable academic risk bands. Sort and inspect profiles to prioritize academic support."
      />

      <div className="filter-bar">
        <div className="field" style={{ flex: 1, maxWidth: 320 }}>
          <label htmlFor="sq">Search student</label>
          <input
            id="sq"
            className="input"
            placeholder="Name, roll no or course..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="srisk">Risk level</label>
          <select id="srisk" className="select" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
            <option value="all">All risk bands</option>
            <option value="high">High risk</option>
            <option value="medium">Medium risk</option>
            <option value="low">Low risk</option>
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll No</th>
              <th>Course</th>
              <th className="num">Quiz Avg</th>
              <th className="num">Late Submissions</th>
              <th>Risk Level</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={`${r.student.id}-${r.course.id}`}>
                <td style={{ fontWeight: 600 }}>{r.student.name}</td>
                <td><Badge tone="neutral">{r.student.rollNo || 'N/A'}</Badge></td>
                <td>{r.course.code}</td>
                <td className="num">{r.avgScore}%</td>
                <td className="num">{r.lateStreak}</td>
                <td>
                  <Badge tone={riskTone(r.risk.band)}>
                    {r.risk.band} ({r.risk.score}/100)
                  </Badge>
                </td>
                <td>
                  <Link to={`/faculty/students/${r.student.id}`} className="btn btn-secondary btn-sm">
                    View profile →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
