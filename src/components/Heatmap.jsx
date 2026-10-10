import { AlertTriangle } from 'lucide-react'
import { EmptyState } from './ui'

// Anonymous class confusion heatmap. Rows are topics, columns are assessments.
// Cell intensity encodes the share of evaluated responses answered incorrectly.
// Only aggregate counts are shown; individual students are never identifiable.
function cellStyle(pct) {
  if (pct == null) return { background: '#f7f7f8', color: '#8b8b94' }
  // White to brand red ramp tuned for readable text at every step.
  const bg = pct >= 60 ? '#c41e24' : pct >= 45 ? '#e8696d' : pct >= 30 ? '#f5b3b5' : pct >= 15 ? '#fad4d5' : '#fdeeee'
  const fg = pct >= 60 ? '#ffffff' : pct >= 45 ? '#5c0e10' : '#5a5a62'
  return { background: bg, color: fg, borderColor: '#e4e4e8' }
}

export default function Heatmap({ assessments, rows }) {
  const hasData = rows.some((r) => r.totalResponses > 0)
  if (!hasData) {
    return (
      <EmptyState icon={AlertTriangle} title="No evaluated responses yet for this course">
        The heatmap fills in as quiz attempts are evaluated. Check back after the next assessment cycle.
      </EmptyState>
    )
  }
  const cols = `160px repeat(${assessments.length + 1}, minmax(110px, 1fr))`
  return (
    <div>
      <div className="hm-grid" style={{ gridTemplateColumns: cols }} role="table" aria-label="Topic confusion heatmap">
        <span className="hm-colhead" style={{ textAlign: 'left' }}>Topic</span>
        {assessments.map((a) => <span key={a} className="hm-colhead">{a}</span>)}
        <span className="hm-colhead" style={{ textAlign: 'left' }}>Overall</span>

        {rows.map((r) => {
          const topicName = r.topic.title || r.topic.name || 'Topic'
          return (
            <span key={r.topic.id} style={{ display: 'contents' }} role="row">
              <span className="hm-label">{topicName}</span>
              {r.cells.map((c, i) => (
                <span key={i} className="hm-cell" style={cellStyle(c.incorrectPct)} role="cell"
                  aria-label={`${topicName}, ${c.assessmentTitle || c.assessment}: ${c.count} responses, ${c.incorrectPct == null ? 'no data' : c.incorrectPct + ' percent incorrect'}`}>
                  {c.count === 0 ? <span className="n">No data</span> : c.enough || c.enoughResponses ? (
                    <>
                      <span>{c.incorrectPct}%</span>
                      <span className="n">{c.count} resp.</span>
                    </>
                  ) : <span className="n">Only {c.count}, low</span>}
                </span>
              ))}
              <span className="hm-cell" style={cellStyle(r.avgIncorrectPct)} role="cell"
                aria-label={`${topicName} overall: ${r.avgIncorrectPct == null ? 'no data' : r.avgIncorrectPct + ' percent incorrect across ' + r.totalResponses + ' responses'}`}>
                {r.avgIncorrectPct == null ? <span className="n">No data</span> : (
                  <>
                    <span>{r.avgIncorrectPct}%</span>
                    <span className="n">{r.totalResponses} resp.</span>
                  </>
                )}
              </span>
            </span>
          )
        })}
      </div>

      <div className="flex mt-16" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div className="hm-scale" aria-hidden="true">
          <span>Low confusion</span>
          {['#fdeeee', '#fad4d5', '#f5b3b5', '#e8696d', '#c41e24'].map((c) => <span key={c} className="sw" style={{ background: c }} />)}
          <span>High confusion</span>
        </div>
        <p className="small muted" style={{ maxWidth: 380 }}>
          Percentages are the share of evaluated answers marked incorrect. Cells with fewer than five evaluated
          responses are marked low-sample and are not compared. Individual students are never shown here.
        </p>
      </div>
    </div>
  )
}
