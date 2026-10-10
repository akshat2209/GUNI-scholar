import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, EmptyState, Field, Loading, PageHeader, Badge, Crumb } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import api from '../../lib/api'

function statusOf(asg, sub) {
  if (sub) return sub.status === 'evaluated' ? { tone: 'ok', label: `Evaluated: ${sub.marks}/${asg.max_marks || 100}` } : { tone: 'ok', label: 'Submitted' }
  const due = new Date(asg.due_at)
  if (new Date() > due) return { tone: 'bad', label: 'Overdue' }
  return { tone: 'warn', label: `Due ${due.toLocaleDateString()}` }
}

function AssignmentDetail({ assignmentId }) {
  const toast = useToast()
  const [asg, setAsg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fileName, setFileName] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadAssignment = async () => {
    try {
      setLoading(true)
      const res = await api.get('/student/assignments')
      const item = (res.assignments || []).find((a) => a.id === assignmentId)
      setAsg(item || null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssignment()
  }, [assignmentId])

  if (loading) return <Loading label="Loading assignment" />
  if (!asg) return <EmptyState title="Assignment not found" />

  const mine = asg.submission
  const status = statusOf(asg, mine)

  async function submit(e) {
    e.preventDefault()
    if (!fileName) {
      setError('Enter a file name or submission path.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/student/assignments/${assignmentId}/submit`, {
        filePath: fileName,
        notes,
      })
      toast(`Submission received for "${asg.title}".`)
      await loadAssignment()
      setFileName('')
      setNotes('')
    } catch (err) {
      setError(err.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <Crumb to="/student/assignments">Back to assignments</Crumb>
      <PageHeader
        title={asg.title}
        sub={`${asg.courses?.code || ''} · Due ${new Date(asg.due_at).toLocaleDateString()} · ${asg.max_marks || 100} marks`}
        actions={<Badge tone={status.tone}>{status.label}</Badge>}
      />

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <Card title="Instructions & Criteria">
          <p style={{ fontSize: 14.5, lineHeight: 1.6 }}>{asg.instructions || asg.description || 'No specific instructions provided.'}</p>
        </Card>

        <Card title="Submit your work">
          {mine ? (
            <>
              <p className="small muted">Your current submission record.</p>
              <div className="table-wrap mt-16" style={{ boxShadow: 'none' }}>
                <table className="data" style={{ minWidth: 0 }}>
                  <thead>
                    <tr>
                      <th>Submitted</th>
                      <th>File / Link</th>
                      <th className="num">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{new Date(mine.submitted_at).toLocaleDateString()}</td>
                      <td><code>{mine.file_path}</code></td>
                      <td className="num">{mine.marks != null ? `${mine.marks}/${asg.max_marks || 100}` : 'Pending'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {mine.feedback && (
                <div className="alert alert-info mt-16">
                  <div className="alert-body"><strong>Faculty feedback:</strong> {mine.feedback}</div>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={submit}>
              {error && <div className="alert alert-bad mb-16"><div className="alert-body">{error}</div></div>}
              <Field label="Submission file or URL" htmlFor="fileInput" error={error}>
                <input id="fileInput" className="input" placeholder="e.g. lab_solution.pdf or github link" value={fileName} onChange={(e) => setFileName(e.target.value)} />
              </Field>
              <Field label="Submission notes (optional)" htmlFor="notesInput">
                <textarea id="notesInput" className="textarea" rows={3} placeholder="Notes for faculty evaluation" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </Field>
              <button className="btn btn-primary mt-12" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Turn in assignment'}
              </button>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}

export default function StudentAssignments() {
  const { assignmentId } = useParams()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await api.get('/student/assignments')
        setAssignments(res.assignments || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (!assignmentId) load()
  }, [assignmentId])

  if (assignmentId) return <AssignmentDetail assignmentId={assignmentId} />
  if (loading) return <Loading label="Loading assignments" />

  return (
    <div className="page">
      <PageHeader title="Assignments" sub="Track all upcoming course assignments, deadlines, submissions, and faculty evaluations." />
      {assignments.length === 0 ? (
        <EmptyState title="No assignments right now">No assignments have been published for your enrolled courses.</EmptyState>
      ) : (
        <div className="grid grid-2">
          {assignments.map((a) => {
            const st = statusOf(a, a.submission)
            return (
              <article key={a.id} className="card card-pad">
                <div className="flex-between">
                  <span className="badge badge-brand">{a.courses?.code || 'Course'}</span>
                  <Badge tone={st.tone}>{st.label}</Badge>
                </div>
                <h3 className="mt-8">{a.title}</h3>
                <p className="small muted mt-8">Max marks: {a.max_marks || 100} · Due: {new Date(a.due_at).toLocaleDateString()}</p>
                <Link className="btn btn-secondary btn-sm mt-16" to={`/student/assignments/${a.id}`}>
                  View & Submit
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
