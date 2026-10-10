// Knowledge gap dependency map: layered DAG of topics and prerequisite
// relations, colored by mastery status. Pure SVG, keyboard accessible.

export function masteryBand(m) {
  if (m == null) return { key: 'none', label: 'Not assessed', color: '#cfcfd6' }
  if (m >= 75) return { key: 'mastered', label: 'Mastered', color: '#12b76a' }
  if (m >= 50) return { key: 'developing', label: 'Developing', color: '#f79009' }
  return { key: 'weak', label: 'Needs improvement', color: '#c41e24' }
}

function depthOf(topic, topics, memo = {}) {
  if (memo[topic.id] != null) return memo[topic.id]
  const d = topic.prereqs.length
    ? 1 + Math.max(...topic.prereqs.map((pid) => depthOf(topics.find((t) => t.id === pid) || { prereqs: [] }, topics, memo)))
    : 0
  memo[topic.id] = d
  return d
}

export default function KnowledgeGraph({ topics, masteryById, selectedId, onSelect }) {
  const memo = {}
  const withDepth = topics.map((t) => ({ ...t, depth: depthOf(t, topics, memo) }))
  const maxDepth = Math.max(0, ...withDepth.map((t) => t.depth))
  const columns = []
  for (const t of withDepth) (columns[t.depth] ||= []).push(t)

  const COL_W = 185, NODE_W = 148, NODE_H = 52
  const width = 60 + (maxDepth + 1) * COL_W
  const height = Math.max(220, Math.max(...columns.map((c) => c.length)) * 86)

  const pos = {}
  withDepth.forEach((t) => {
    const col = columns[t.depth]
    const idx = col.indexOf(t)
    const colH = col.length * 86
    pos[t.id] = { x: 40 + t.depth * COL_W, y: (height - colH) / 2 + idx * 86 + 17 }
  })

  const bandOf = (t) => masteryBand(masteryById[t.id])
  const weak = new Set(withDepth.filter((t) => bandOf(t).key === 'weak').map((t) => t.id))

  // Find prerequisites of selected topic
  const selectedTopic = withDepth.find((t) => t.id === selectedId)
  const selectedPrereqs = new Set(selectedTopic ? selectedTopic.prereqs : [])

  return (
    <div className="kg-canvas">
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="group" aria-label="Topic prerequisite graph">
        {withDepth.flatMap((t) =>
          t.prereqs.map((pid) => {
            const a = pos[pid], b = pos[t.id]
            if (!a || !b) return null
            const x1 = a.x + NODE_W, y1 = a.y + NODE_H / 2
            const x2 = b.x, y2 = b.y + NODE_H / 2
            const isWeakLink = weak.has(pid) || weak.has(t.id)
            const isSelectedLink = t.id === selectedId || (selectedTopic && selectedPrereqs.has(t.id))
            const hot = isWeakLink || isSelectedLink
            const mx = (x1 + x2) / 2
            return (
              <path
                key={`${pid}-${t.id}`}
                d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2 - 6} ${y2}`}
                fill="none"
                stroke={isWeakLink ? '#c41e24' : isSelectedLink ? '#175cd3' : '#cfcfd6'}
                strokeWidth={hot ? 2 : 1.5}
                strokeDasharray={isWeakLink ? '5 4' : 'none'}
                markerEnd={isWeakLink ? 'url(#arrowHot)' : 'url(#arrow)'}
              />
            )
          }),
        )}
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#cfcfd6" />
          </marker>
          <marker id="arrowHot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#c41e24" />
          </marker>
        </defs>
        {withDepth.map((t) => {
          const p = pos[t.id]
          if (!p) return null
          const band = bandOf(t)
          const m = masteryById[t.id]
          const isSelectedPrereqWeak = selectedPrereqs.has(t.id) && band.key === 'weak'
          return (
            <g
              key={t.id}
              className={`kg-node ${selectedId === t.id ? 'selected' : ''}`}
              onClick={() => onSelect(t.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(t.id) } }}
              tabIndex={0}
              role="button"
              aria-label={`${t.name}, ${band.label}${m != null ? `, mastery ${m} percent` : ', not assessed'}`}
            >
              <rect x={p.x} y={p.y} width={NODE_W} height={NODE_H} rx="8"
                fill={band.key === 'weak' ? '#fdf1f1' : band.key === 'developing' ? '#fff6e6' : band.key === 'mastered' ? '#ecfdf3' : '#f7f7f8'}
                stroke={isSelectedPrereqWeak ? '#c41e24' : band.key === 'weak' ? '#c41e24' : band.key === 'developing' ? '#f79009' : band.key === 'mastered' ? '#12b76a' : '#cfcfd6'}
                strokeWidth={selectedId === t.id ? 2.5 : isSelectedPrereqWeak ? 2 : 1.25} />
              <text x={p.x + 12} y={p.y + 21} style={{ fontWeight: 700 }}>{t.short}</text>
              <text x={p.x + 12} y={p.y + 39} style={{ fontWeight: 500, fill: '#5a5a62' }}>
                {m != null ? `${m}% mastery` : 'Not assessed'}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="kg-legend">
        <span><span className="dot" style={{ background: '#12b76a' }} /> Mastered (75% or above)</span>
        <span><span className="dot" style={{ background: '#f79009' }} /> Developing (50% to 74%)</span>
        <span><span className="dot" style={{ background: '#c41e24' }} /> Needs improvement (below 50%)</span>
        <span><span className="dot" style={{ background: '#cfcfd6' }} /> Not assessed</span>
      </div>
    </div>
  )
}
