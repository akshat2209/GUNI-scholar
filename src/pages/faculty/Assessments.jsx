import { useEffect, useState } from 'react'
import { Card, EmptyState, Field, PageHeader, Badge, Loading } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import api from '../../lib/api'

function QuestionEditor({ questions, setQuestions, topics, courseId }) {
  const [q, setQ] = useState({ prompt: '', options: ['', '', '', ''], correct: 0, topicId: '', explanation: '' })
  const [errors, setErrors] = useState({})

  function add() {
    const errs = {}
    if (q.prompt.trim().length < 8) errs.prompt = 'Write the question prompt in at least 8 characters.'
    if (q.options.some((o) => !o.trim())) errs.options = 'Fill in all four multiple-choice options.'
    if (!q.topicId) errs.topicId = 'Select the syllabus topic for analytics tracking.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setQuestions([
      ...questions,
      {
        id: 'temp-' + (questions.length + 1),
        prompt: q.prompt.trim(),
        options: q.options.map((o) => o.trim()),
        correctAnswer: q.options[q.correct].trim(),
        topicId: q.topicId,
        explanation: q.explanation.trim() || undefined,
        marks: 1,
      },
    ])
    setQ({ prompt: '', options: ['', '', '', ''], correct: 0, topicId: q.topicId, explanation: '' })
  }

  return (
    <Card
      title={`Quiz Questions (${questions.length} added)`}
      sub="Every question is tagged with a syllabus topic to power continuous mastery analytics and the confusion heatmap."
    >
      <Field label="Question prompt" htmlFor="qprompt" error={errors.prompt}>
        <textarea
          id="qprompt"
          className="textarea"
          style={{ minHeight: 70 }}
          value={q.prompt}
          onChange={(e) => setQ({ ...q, prompt: e.target.value })}
          aria-invalid={!!errors.prompt}
          placeholder="e.g. Which of the following data structures provides O(1) average-case lookup?"
        />
      </Field>

      {q.options.map((o, i) => (
        <Field
          key={i}
          label={`Option ${i + 1}${q.correct === i ? ' (Marked as Correct Answer)' : ''}`}
          htmlFor={`opt${i}`}
          error={i === 0 ? errors.options : undefined}
        >
          <div className="flex" style={{ gap: 10, alignItems: 'center' }}>
            <input
              type="radio"
              name="correctOption"
              id={`radio-${i}`}
              checked={q.correct === i}
              onChange={() => setQ({ ...q, correct: i })}
              aria-label={`Mark option ${i + 1} as correct`}
            />
            <input
              id={`opt${i}`}
              className="input"
              value={o}
              placeholder={`Option ${i + 1} text`}
              onChange={(e) => {
                const next = [...q.options]
                next[i] = e.target.value
                setQ({ ...q, options: next })
              }}
            />
          </div>
        </Field>
      ))}

      <div className="form-row">
        <Field label="Topic tag" htmlFor="qtopic" error={errors.topicId}>
          <select
            id="qtopic"
            className="select"
            value={q.topicId}
            onChange={(e) => setQ({ ...q, topicId: e.target.value })}
            aria-invalid={!!errors.topicId}
            disabled={!courseId}
          >
            <option value="">{courseId ? 'Select topic' : 'Pick a course first'}</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </Field>

        <Field label="Explanation (shown after quiz)" htmlFor="qexp">
          <input
            id="qexp"
            className="input"
            value={q.explanation}
            onChange={(e) => setQ({ ...q, explanation: e.target.value })}
            placeholder="Brief rationale for this answer"
          />
        </Field>
      </div>

      <button
        type="button"
        className="btn btn-secondary mt-8"
        onClick={add}
        disabled={!courseId}
      >
        + Add question to quiz
      </button>

      {questions.length > 0 && (
        <ul style={{ listStyle: 'none', marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {questions.map((x, i) => {
            const topic = topics.find((t) => t.id === x.topicId)
            return (
              <li key={x.id} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="small" style={{ flex: 1, paddingRight: 12 }}>
                  <strong>Q{i + 1}.</strong> {x.prompt}
                  <div className="muted mt-4">
                    Correct: <strong>{x.correctAnswer}</strong> · Topic: {topic?.title || 'General'}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setQuestions(questions.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export default function FacultyAssessments() {
  const { user } = useAuth()
  const toast = useToast()

  const [courses, setCourses] = useState([])
  const [assessments, setAssessments] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    courseId: '',
    title: '',
    durationMinutes: 30,
    dueAt: '',
  })
  const [questions, setQuestions] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [coursesRes, asstsRes] = await Promise.all([
        api.get('/faculty/courses'),
        api.get('/faculty/assessments'),
      ])
      const cList = coursesRes.courses || []
      setCourses(cList)
      setAssessments(asstsRes.assessments || [])

      if (cList.length > 0 && !form.courseId) {
        setForm((f) => ({ ...f, courseId: cList[0].id }))
        const courseDetail = await api.get(`/faculty/courses/${cList[0].id}`)
        setTopics(courseDetail.topics || [])
      }
    } catch (err) {
      console.error('Failed to load assessments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) loadData()
  }, [user?.id])

  const handleCourseChange = async (newCourseId) => {
    setForm({ ...form, courseId: newCourseId })
    setQuestions([])
    if (newCourseId) {
      try {
        const detail = await api.get(`/faculty/courses/${newCourseId}`)
        setTopics(detail.topics || [])
      } catch (err) {
        console.error('Failed to load topics:', err)
      }
    } else {
      setTopics([])
    }
  }

  async function publish(e) {
    e.preventDefault()
    const errs = {}
    if (!form.courseId) errs.courseId = 'Select a course.'
    if (form.title.trim().length < 5) errs.title = 'Quiz title must be at least 5 characters.'
    if (!form.dueAt) errs.dueAt = 'Select a deadline for the quiz.'
    if (questions.length < 1) errs.questions = 'Add at least 1 question to the assessment.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      await api.post(`/faculty/courses/${form.courseId}/assessments`, {
        title: form.title.trim(),
        durationMinutes: Number(form.durationMinutes) || 30,
        dueAt: new Date(form.dueAt).toISOString(),
        questions: questions.map((q) => ({
          topicId: q.topicId,
          prompt: q.prompt,
          options: q.options,
          marks: 1,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        })),
      })
      toast(`Assessment "${form.title}" published with ${questions.length} questions.`)
      setForm({
        courseId: courses[0]?.id || '',
        title: '',
        durationMinutes: 30,
        dueAt: '',
      })
      setQuestions([])
      await loadData()
    } catch (err) {
      setErrors({ questions: err.message || 'Failed to create assessment' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loading label="Loading assessments builder" />

  return (
    <div className="page">
      <PageHeader
        title="Assessment Builder"
        sub="Create topic-tagged quizzes, set auto-grading answer keys, and track class attempt completion."
      />

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card title="Quiz configuration">
            <form onSubmit={publish} noValidate>
              <Field label="Course" htmlFor="zcourse" error={errors.courseId}>
                <select
                  id="zcourse"
                  className="select"
                  value={form.courseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  aria-invalid={!!errors.courseId}
                >
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                  ))}
                </select>
              </Field>

              <Field label="Quiz Title" htmlFor="ztitle" error={errors.title}>
                <input
                  id="ztitle"
                  className="input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  aria-invalid={!!errors.title}
                  placeholder="e.g. Unit Test 2 — Graph Traversal & Shortest Paths"
                />
              </Field>

              <div className="form-row">
                <Field label="Deadline" htmlFor="zdue" error={errors.dueAt}>
                  <input
                    id="zdue"
                    type="date"
                    className="input"
                    value={form.dueAt}
                    onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
                    aria-invalid={!!errors.dueAt}
                  />
                </Field>
                <Field label="Duration (minutes)" htmlFor="ztime">
                  <input
                    id="ztime"
                    className="input"
                    type="number"
                    min="5"
                    max="180"
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                  />
                </Field>
              </div>

              {errors.questions && <p className="field-error mt-12" role="alert">{errors.questions}</p>}

              <button className="btn btn-primary mt-12" type="submit" disabled={submitting}>
                {submitting ? 'Publishing...' : 'Publish quiz'}
              </button>
            </form>
          </Card>

          <QuestionEditor
            questions={questions}
            setQuestions={setQuestions}
            topics={topics}
            courseId={form.courseId}
          />
        </div>

        <Card title={`Published quizzes (${assessments.length})`} tight>
          {assessments.length === 0 ? (
            <EmptyState title="No quizzes yet">
              Build and publish your first quiz using the form on the left.
            </EmptyState>
          ) : (
            <div className="table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="data" style={{ minWidth: 440 }}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Course</th>
                    <th className="num">Questions</th>
                    <th className="num">Attempts</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.title}</td>
                      <td>{a.courses?.code || 'Course'}</td>
                      <td className="num">{a.questionCount || 0}</td>
                      <td className="num">{a.attemptCount || 0}</td>
                      <td>
                        <Badge tone={a.published ? 'ok' : 'neutral'}>
                          {a.published ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="small muted card-body-tight">
            Topic tags on questions decide where results land in the heatmap and in per-topic student mastery.
          </p>
        </Card>
      </div>
    </div>
  )
}
