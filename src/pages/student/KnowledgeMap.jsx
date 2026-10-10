import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Card, EmptyState, Loading, PageHeader } from '../../components/ui'
import KnowledgeGraph from '../../components/KnowledgeGraph'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'

export default function KnowledgeMap() {
  const { user } = useAuth()
  const { courseId } = useParams()
  const [courses, setCourses] = useState([])
  const [activeCourse, setActiveCourse] = useState(null)
  const [topics, setTopics] = useState([])
  const [resources, setResources] = useState([])
  const [masteryById, setMasteryById] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)

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
          const [courseDetail, analyticsRes] = await Promise.all([
            api.get(`/student/courses/${active.id}`),
            api.get(`/student/analytics/${active.id}`),
          ])

          const tList = (courseDetail.topics || []).map((t) => ({
            id: t.id,
            name: t.title,
            short: t.title.split(' ')[0],
            prereqs: t.prerequisites || [],
          }))
          setTopics(tList)
          setResources(courseDetail.resources || [])

          const mMap = {}
          ;(analyticsRes.topics || []).forEach((t) => {
            mMap[t.id] = t.mastery || 70
          })
          setMasteryById(mMap)
        }
      } catch (err) {
        console.error('Failed to load knowledge map:', err)
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
          <PageHeader title="Knowledge Gap Dependency Map" sub="No enrolled courses." />
          <EmptyState title="No enrolled courses" />
        </div>
      )
    }
    return <Loading label="Building your knowledge map" />
  }

  const selected = topics.find((t) => t.id === selectedId)
  const selectedMastery = selected ? masteryById[selected.id] : null
  const selectedResources = selected ? resources.filter((r) => r.topic_id === selected.id) : []

  return (
    <div className="page">
      <PageHeader
        title="Knowledge Gap Dependency Map"
        sub={`How the topics of ${activeCourse.code} · ${activeCourse.title} depend on each other, and where your gaps sit in that chain. Select a topic node for detail.`}
      />
      <div className="wrap-gap" role="navigation" aria-label="Switch course">
        {courses.map((c) => (
          <Link
            key={c.id}
            to={`/student/knowledge-map/${c.id}`}
            className={`btn btn-sm ${c.id === activeCourse.id ? 'btn-primary' : 'btn-secondary'}`}
            aria-current={c.id === activeCourse.id ? 'true' : undefined}
          >
            {c.short} - {c.title}
          </Link>
        ))}
      </div>

      <div className="kg-layout">
        <KnowledgeGraph topics={topics} masteryById={masteryById} selectedId={selectedId} onSelect={setSelectedId} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card
            title={selected ? selected.name : 'Select a topic'}
            sub={
              selected
                ? `Prerequisites: ${(selected.prereqs || []).map((p) => topics.find((t) => t.id === p)?.short).filter(Boolean).join(', ') || 'None, foundation topic'}`
                : 'Click a topic in the graph to inspect prerequisites and resources.'
            }
          >
            {selected ? (
              <>
                <div className="flex-between mb-16">
                  <span className="small muted">Your mastery score:</span>
                  <Badge tone={selectedMastery >= 70 ? 'ok' : selectedMastery >= 40 ? 'warn' : 'bad'}>
                    {selectedMastery != null ? `${selectedMastery}%` : 'Not assessed'}
                  </Badge>
                </div>
                <h4>Recommended study material</h4>
                {selectedResources.length === 0 ? (
                  <p className="small muted mt-8">No specific resources tagged for this topic yet.</p>
                ) : (
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    {selectedResources.map((r) => (
                      <li key={r.id}>
                        <a href={r.url || '#'} target="_blank" rel="noreferrer" className="small" style={{ fontWeight: 600 }}>
                          {r.title}
                        </a>
                        <span className="small muted"> ({r.type})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="small muted">Select any topic in the dependency graph on the left to view details and recommendations.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
