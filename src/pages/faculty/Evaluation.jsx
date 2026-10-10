import { useEffect, useState } from 'react'
import { Card, EmptyState, Field, PageHeader, Badge, Loading } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import api from '../../lib/api'

function EvaluationRow({ sub, maxMarks, onEvaluated }) {
  const toast = useToast()
  const student = sub.profiles || { full_name: 'Student', roll_no: 'N/A', email: '' }
  const [marks, setMarks] = useState(sub.marks != null ? String(sub.marks) : '')
  const [feedback, setFeedback] = useState(sub.feedback || '')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  async function save(e) {
    e.preventDefault()
    const m = Number(marks)
    if (marks === '' || Number.isNaN(m) || m < 0 || m > (maxMarks || 100)) {
      setErr(`Marks must be a number between 0 and ${maxMarks || 100}.`)
      return
    }

    setSaving(true)
    setErr('')
    try {
      const res = await api.post(`/faculty/submissions/${sub.id}/evaluate`, {
        marks: m,
        feedback: feedback.trim(),
      })
      toast(`Evaluation saved for ${student.full_name}: ${m}/${maxMarks || 100}.`)
      onEvaluated(res.submission)
    } catch (saveErr) {
      setErr(saveErr.message || 'Failed to save evaluation')
    } finally {
      setSaving(false)
    }
  }

  const isEvaluated = sub.status === 'evaluated'
  const isLate = sub.status === 'late' || (sub.submitted_at && new Date(sub.submitted_at) > new Date(sub.due_at))

  return (
    <form onSubmit={save} style={{ borderBottom: '1px solid var(--border)', padding: '18px 0' }} noValidate>
      <div className="flex-between">
        <div>
          <strong style={{ fontSize: 15 }}>{student.full_name}</strong>{' '}
          <span className="muted small">({student.roll_no || student.email})</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge tone={isLate ? 'warn' : 'ok'}>
            {isLate ? 'Late submission' : 'On-time'} · {new Date(sub.submitted_at).toLocaleDateString()}
          </Badge>
          <Badge tone={isEvaluated ? 'ok' : 'neutral'}>
            {isEvaluated ? `Evaluated: ${sub.marks}/${maxMarks}` : 'Pending evaluation'}
          </Badge>
        </div>
      </div>

      <p className="small muted mt-8">
        File: <code>{sub.file_path || 'Direct submission'}</code>
      </p>

      {sub.notes && (
        <p className="small mt-4">
          <strong>Student notes:</strong> {sub.notes}
        </p>
      )}

      <div className="form-row mt-12" style={{ alignItems: 'start' }}>
        <Field label={`Marks (out of ${maxMarks || 100})`} htmlFor={`m-${sub.id}`} error={err}>
          <input
            id={`m-${sub.id}`}
            className="input"
            type="number"
            min="0"
            max={maxMarks || 100}
            value={marks}
            onChange={(e) => { setMarks(e.target.value); setErr('') }}
            aria-invalid={!!err}
            style={{ maxWidth: 140 }}
          />
        </Field>
        <Field label="Feedback to student" htmlFor={`f-${sub.id}`}>
          <textarea
            id={`f-${sub.id}`}
            className="textarea"
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Feedback on what was done well and areas needing improvement..."
          />
        </Field>
      </div>

      <button className="btn btn-primary btn-sm mt-4" disabled={saving}>
        {saving ? 'Saving...' : 'Save evaluation'}
      </button>
    </form>
  )
}

export default function FacultyEvaluation() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [assignments, setAssignments] = useState([])
  const [selectedAsgId, setSelectedAsgId] = useState('')
  const [submissions, setSubmissions] = useState([])
  const [activeAsg, setActiveAsg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingSubs, setLoadingSubs] = useState(false)

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true)
        const coursesRes = await api.get('/faculty/courses')
        const cList = coursesRes.courses || []
        setCourses(cList)

        if (cList.length > 0) {
          const firstCourse = cList[0]
          setSelectedCourseId(firstCourse.id)
          await loadCourseAssignments(firstCourse.id)
        }
      } catch (err) {
        console.error('Failed to load courses for evaluation:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) loadCourses()
  }, [user?.id])

  const loadCourseAssignments = async (courseId) => {
    try {
      const detail = await api.get(`/faculty/courses/${courseId}`)
      const asgList = detail.assignments || []
      setAssignments(asgList)
      if (asgList.length > 0) {
        const firstAsg = asgList[0]
        setSelectedAsgId(firstAsg.id)
        setActiveAsg(firstAsg)
        await loadSubmissions(firstAsg.id)
      } else {
        setSelectedAsgId('')
        setActiveAsg(null)
        setSubmissions([])
      }
    } catch (err) {
      console.error('Failed to load assignments:', err)
    }
  }

  const loadSubmissions = async (asgId) => {
    try {
      setLoadingSubs(true)
      const res = await api.get(`/faculty/assignments/${asgId}/submissions`)
      setSubmissions(res.submissions || [])
      if (res.assignment) setActiveAsg(res.assignment)
    } catch (err) {
      console.error('Failed to load submissions:', err)
    } finally {
      setLoadingSubs(false)
    }
  }

  const handleCourseChange = async (courseId) => {
    setSelectedCourseId(courseId)
    await loadCourseAssignments(courseId)
  }

  const handleAsgChange = async (asgId) => {
    setSelectedAsgId(asgId)
    const found = assignments.find((a) => a.id === asgId)
    if (found) setActiveAsg(found)
    await loadSubmissions(asgId)
  }

  const handleSubmissionEvaluated = (updatedSub) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === updatedSub.id ? { ...s, ...updatedSub } : s)),
    )
  }

  if (loading) return <Loading label="Loading evaluation queue" />

  const pendingCount = submissions.filter((s) => s.status !== 'evaluated').length

  return (
    <div className="page">
      <PageHeader
        title="Submission Evaluation"
        sub="Enter marks and structured feedback for student submissions. Grades instantly sync to learning mastery scores."
      />

      <div className="filter-bar">
        <div className="field">
          <label htmlFor="ecourse">Course</label>
          <select
            id="ecourse"
            className="select"
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="field" style={{ minWidth: 280 }}>
          <label htmlFor="easg">Assignment</label>
          <select
            id="easg"
            className="select"
            value={selectedAsgId}
            onChange={(e) => handleAsgChange(e.target.value)}
            disabled={assignments.length === 0}
          >
            {assignments.length === 0 ? (
              <option value="">No assignments in this course</option>
            ) : (
              assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} (Max {a.max_marks || 100} pts)
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {!activeAsg ? (
        <Card>
          <EmptyState title="No assignment selected">
            Create an assignment for this course to begin reviewing submissions.
          </EmptyState>
        </Card>
      ) : loadingSubs ? (
        <Loading label="Fetching submissions" />
      ) : (
        <Card
          title={`${activeAsg.title} submissions`}
          sub={`${submissions.length} submissions received. ${pendingCount} pending evaluation.`}
          actions={
            pendingCount > 0 ? (
              <Badge tone="warn">{pendingCount} to evaluate</Badge>
            ) : (
              <Badge tone="ok">All evaluated</Badge>
            )
          }
        >
          {submissions.length === 0 ? (
            <EmptyState title="No submissions yet">
              Students have not turned in any files for this assignment yet.
            </EmptyState>
          ) : (
            submissions.map((s) => (
              <EvaluationRow
                key={s.id}
                sub={s}
                maxMarks={activeAsg.max_marks || 100}
                onEvaluated={handleSubmissionEvaluated}
              />
            ))
          )}
        </Card>
      )}
    </div>
  )
}
