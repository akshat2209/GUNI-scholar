import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, EmptyState, Loading, PageHeader, Badge, Crumb } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import api from '../../lib/api'

function AttemptQuiz({ assessment, questions, onDone }) {
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const q = questions[idx]

  function pick(opt) {
    setAnswers((a) => ({ ...a, [q.id]: opt }))
    setError('')
  }

  async function submit() {
    if (Object.keys(answers).length < questions.length) {
      setError(`Answer all questions before submitting. ${questions.length - Object.keys(answers).length} unanswered.`)
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const { attemptId } = await api.post(`/student/assessments/${assessment.id}/start`)

      const payload = {
        attemptId,
        answers: Object.entries(answers).map(([qId, val]) => ({
          questionId: qId,
          selectedAnswer: typeof val === 'number' ? questions.find((x) => x.id === qId)?.options[val] : String(val),
        })),
      }

      const res = await api.post(`/student/assessments/${assessment.id}/submit`, payload)
      onDone(res)
    } catch (err) {
      setError(err.message || 'Failed to grade assessment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <Crumb to="/student/assessments">Back to assessments</Crumb>
      <PageHeader
        title={assessment.title}
        sub={`Question ${idx + 1} of ${questions.length}. Answer every question, then submit for server evaluation.`}
      />
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
        <Card title={`Question ${idx + 1}`}>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-900)' }}>{q.prompt || q.text}</p>
          <div role="radiogroup" aria-label={`Options for question ${idx + 1}`} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
            {(q.options || []).map((opt, i) => (
              <label key={i} className={`option-row ${answers[q.id] === i ? 'selected' : ''}`}>
                <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === i} onChange={() => pick(i)} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          {error && <p className="field-error mt-12" role="alert">{error}</p>}
          <div className="flex mt-24" style={{ justifyContent: 'space-between' }}>
            <button type="button" className="btn btn-secondary" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Previous</button>
            {idx < questions.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={() => setIdx(idx + 1)}>Next question</button>
            ) : (
              <button type="button" className="btn btn-primary" disabled={submitting} onClick={submit}>
                {submitting ? 'Grading...' : 'Submit quiz'}
              </button>
            )}
          </div>
        </Card>

        <Card title="Question palette">
          <p className="small muted mb-16">Green numbers are answered. Use the palette to jump between questions.</p>
          <div className="q-palette">
            {questions.map((x, i) => (
              <button
                key={x.id}
                type="button"
                className={`${answers[x.id] != null ? 'answered' : ''} ${i === idx ? 'current' : ''}`}
                onClick={() => setIdx(i)}
                aria-label={`Go to question ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function AssessmentDetail({ assessmentId }) {
  const toast = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [taking, setTaking] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/student/assessments/${assessmentId}`)
      setData(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [assessmentId])

  if (loading) return <Loading label="Loading assessment" />
  if (!data || !data.assessment) return <EmptyState title="Assessment not found" />

  const { assessment, questions = [], attempts = [] } = data

  if (taking) {
    return (
      <AttemptQuiz
        assessment={assessment}
        questions={questions}
        onDone={() => {
          setTaking(false)
          toast('Assessment submitted and graded successfully!')
          loadData()
        }}
      />
    )
  }

  const latestAttempt = attempts[attempts.length - 1]

  return (
    <div className="page">
      <Crumb to="/student/assessments">Back to assessments</Crumb>
      <PageHeader
        title={assessment.title}
        sub={`${assessment.courses?.code || ''} · ${questions.length} questions · Duration: ${assessment.duration_minutes || 30} mins`}
        actions={
          latestAttempt ? (
            <Badge tone="ok">Completed ({Math.round(latestAttempt.score || 0)}%)</Badge>
          ) : (
            <button className="btn btn-primary" onClick={() => setTaking(true)}>
              Start assessment
            </button>
          )
        }
      />

      <div className="grid grid-2">
        <Card title="Assessment overview">
          <p>{assessment.description || 'Topic evaluation quiz testing concepts and practical reasoning.'}</p>
          <div className="mt-16">
            <strong>Due date:</strong> {new Date(assessment.due_at).toLocaleDateString()}
          </div>
          {!latestAttempt && (
            <button className="btn btn-primary mt-20" onClick={() => setTaking(true)}>
              Begin Quiz Now
            </button>
          )}
        </Card>

        <Card title="Attempt history">
          {attempts.length === 0 ? (
            <EmptyState title="No attempts yet">Click start assessment to begin.</EmptyState>
          ) : (
            <div className="table-wrap" style={{ boxShadow: 'none' }}>
              <table className="data" style={{ minWidth: 0 }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th className="num">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((att) => (
                    <tr key={att.id}>
                      <td>{new Date(att.submitted_at || att.started_at).toLocaleDateString()}</td>
                      <td className="num">{Math.round(att.score || 0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default function StudentAssessments() {
  const { assessmentId } = useParams()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await api.get('/student/assessments')
        setAssessments(res.assessments || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (!assessmentId) load()
  }, [assessmentId])

  if (assessmentId) return <AssessmentDetail assessmentId={assessmentId} />
  if (loading) return <Loading label="Loading assessments" />

  return (
    <div className="page">
      <PageHeader title="Assessments" sub="Take topic quizzes, test conceptual understanding, and review score history." />
      {assessments.length === 0 ? (
        <EmptyState title="No assessments available">No published assessments for your enrolled courses.</EmptyState>
      ) : (
        <div className="grid grid-2">
          {assessments.map((a) => {
            const hasAttempted = a.attempts && a.attempts.length > 0
            const bestScore = hasAttempted ? Math.max(...a.attempts.map((att) => att.score || 0)) : null
            return (
              <article key={a.id} className="card card-pad">
                <div className="flex-between">
                  <span className="badge badge-brand">{a.courses?.code || 'Course'}</span>
                  {hasAttempted ? (
                    <Badge tone="ok">Score: {Math.round(bestScore)}%</Badge>
                  ) : (
                    <Badge tone="warn">Due {new Date(a.due_at).toLocaleDateString()}</Badge>
                  )}
                </div>
                <h3 className="mt-8">{a.title}</h3>
                <p className="small muted mt-8">Duration: {a.duration_minutes || 30} mins</p>
                <Link className="btn btn-secondary btn-sm mt-16" to={`/student/assessments/${a.id}`}>
                  {hasAttempted ? 'View results' : 'Start quiz'}
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
