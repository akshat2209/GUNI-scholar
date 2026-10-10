import { useEffect, useState } from 'react'
import { Card, EmptyState, Loading, PageHeader, StatCard, Tabs } from '../../components/ui'
import api from '../../lib/api'

const TABS = [
  { id: 'performance', label: 'Course performance' },
  { id: 'risk', label: 'Risk summary' },
  { id: 'topics', label: 'Difficult topics' },
]

export default function DeanDashboard() {
  const [tab, setTab] = useState('performance')
  const [overview, setOverview] = useState(null)
  const [courseRows, setCourseRows] = useState([])
  const [difficultTopics, setDifficultTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [ov, cr, dt] = await Promise.all([
          api.get('/dean/overview'),
          api.get('/dean/courses'),
          api.get('/dean/difficult-topics'),
        ])
        setOverview(ov)
        setCourseRows(cr.courses || [])
        setDifficultTopics(dt.difficultTopics || [])
      } catch (err) {
        console.error('Dean dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Loading label="Loading academic overview for Dean" />

  const totals = overview?.riskDistribution || { high: 0, medium: 0, low: 0, totalAtRisk: 0 }
  const topDifficult = difficultTopics[0]

  return (
    <div className="page">
      <PageHeader
        title="Academic Overview"
        sub="Institute-level view across all Ganpat University courses. Aggregated metrics for deans and academic leadership."
      />

      <div className="grid grid-4">
        <StatCard label="Courses tracked" value={overview?.totalCourses || courseRows.length} meta="Active semester courses" />
        <StatCard label="Students at risk" value={totals.totalAtRisk} meta={`${totals.high} high, ${totals.medium} medium risk`} />
        <StatCard label="Average score" value={`${overview?.avgScore || 75}%`} meta="Across all course assessments" />
        <StatCard
          label="Difficult topic"
          value={topDifficult?.topic?.title?.split(' ')[0] || 'N/A'}
          meta={topDifficult ? `${topDifficult.incorrectPct}% error rate, ${topDifficult.course?.code || ''}` : 'No data yet'}
        />
      </div>

      <Card>
        <Tabs tabs={TABS} active={tab} onChange={setTab} label="Academic overview sections" />
        <div className="card-body">
          {tab === 'performance' && (
            <div className="table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
              {courseRows.length === 0 ? (
                <EmptyState title="No course performance data yet" />
              ) : (
                <table className="data" style={{ minWidth: 640 }}>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Department</th>
                      <th className="num">Avg score</th>
                      <th className="num">Enrolled</th>
                      <th className="num">Risk high</th>
                      <th className="num">Risk medium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseRows.map((r) => (
                      <tr key={r.course.id}>
                        <td style={{ fontWeight: 600 }}>{r.course.code} - {r.course.title}</td>
                        <td>{r.course.departments?.code || 'CSE'}</td>
                        <td className="num">{r.avgScore}%</td>
                        <td className="num">{r.enrolledCount}</td>
                        <td className="num">{r.riskHigh}</td>
                        <td className="num">{r.riskMedium}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'risk' && (
            <div>
              <p className="small muted mb-16">Overview of student risk distribution across all courses.</p>
              <div className="grid grid-3">
                <Card title="High Risk Students" tight>
                  <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--bad-text)' }}>{totals.high}</p>
                  <span className="small muted">Score ≥ 60/100 (Immediate intervention)</span>
                </Card>
                <Card title="Medium Risk Students" tight>
                  <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--warn-text)' }}>{totals.medium}</p>
                  <span className="small muted">Score 30–59/100 (Monitor & nudge)</span>
                </Card>
                <Card title="Low Risk Students" tight>
                  <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--ok-text)' }}>{totals.low}</p>
                  <span className="small muted">Score &lt; 30/100 (Healthy progress)</span>
                </Card>
              </div>
            </div>
          )}

          {tab === 'topics' && (
            <div className="table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
              {difficultTopics.length === 0 ? (
                <EmptyState title="No topic data available" />
              ) : (
                <table className="data" style={{ minWidth: 500 }}>
                  <thead>
                    <tr>
                      <th>Topic</th>
                      <th>Course</th>
                      <th className="num">Responses</th>
                      <th className="num">Error Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {difficultTopics.map((dt) => (
                      <tr key={dt.topic.id}>
                        <td style={{ fontWeight: 600 }}>{dt.topic.title}</td>
                        <td>{dt.course?.code || 'Course'}</td>
                        <td className="num">{dt.totalResponses}</td>
                        <td className="num" style={{ color: dt.incorrectPct >= 50 ? 'var(--bad-text)' : 'inherit', fontWeight: 600 }}>
                          {dt.incorrectPct}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
