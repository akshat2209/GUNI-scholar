import { useEffect, useState } from 'react'
import { Card, Loading, PageHeader, EmptyState } from '../../components/ui'
import Heatmap from '../../components/Heatmap'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'

export default function FacultyHeatmap() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingHeatmap, setLoadingHeatmap] = useState(false)

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true)
        const res = await api.get('/faculty/courses')
        const cList = res.courses || []
        setCourses(cList)
        if (cList.length > 0) {
          setSelectedCourseId(cList[0].id)
        }
      } catch (err) {
        console.error('Failed to load courses for heatmap:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) loadCourses()
  }, [user?.id])

  useEffect(() => {
    async function loadHeatmap() {
      if (!selectedCourseId) return
      try {
        setLoadingHeatmap(true)
        const res = await api.get(`/faculty/heatmap/${selectedCourseId}`)
        setData(res)
      } catch (err) {
        console.error('Failed to load confusion heatmap:', err)
      } finally {
        setLoadingHeatmap(false)
      }
    }
    loadHeatmap()
  }, [selectedCourseId])

  if (loading) return <Loading label="Loading courses for heatmap" />

  const activeCourse = courses.find((c) => c.id === selectedCourseId) || courses[0]

  return (
    <div className="page">
      <PageHeader
        title="Anonymous Class Confusion Heatmap"
        sub="Identify where the class collectively answers incorrectly by syllabus topic and assessment. Aggregated strictly from evaluated student responses."
      />

      <div className="filter-bar">
        <div className="field">
          <label htmlFor="hcourse">Select Course</label>
          <select
            id="hcourse"
            className="select"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingHeatmap ? (
        <Loading label="Aggregating class responses into confusion matrix" />
      ) : !data || !data.rows || data.rows.length === 0 ? (
        <Card title={`${activeCourse?.code || 'Course'} Confusion Matrix`}>
          <EmptyState title="No assessment data available">
            Students have not completed any quizzes with questions in this course yet.
          </EmptyState>
        </Card>
      ) : (
        <Card
          title={`${activeCourse?.code || 'Course'} Confusion by Topic`}
          sub="Rows represent syllabus topics, columns represent quizzes. Darker red cells indicate higher error rates."
        >
          <Heatmap assessments={data.assessments || []} rows={data.rows} />
        </Card>
      )}

      <Card title="Pedagogical Action Guidelines">
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14.5, listStyle: 'disc' }}>
          <li>
            <strong>Topics above 60% error rate:</strong> Require a direct lecture recap or re-teach session before upcoming cumulative units build on these concepts.
          </li>
          <li>
            <strong>Topics between 40% and 60% error rate:</strong> Strong revision candidates; upload additional practice sets or guided video walk-throughs in the course management tab.
          </li>
          <li>
            <strong>Low sample size safeguard:</strong> Cells with fewer than 3 student responses are marked with low sample indicators so isolated mistakes do not distort class-wide insights.
          </li>
        </ul>
      </Card>
    </div>
  )
}
