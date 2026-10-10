import { AlertTriangle, ChevronLeft, Inbox, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PageHeader({ title, sub, actions, breadcrumb }) {
  return (
    <div className="page-header-wrap">
      {breadcrumb && <div className="crumb-nav">{breadcrumb}</div>}
      <div className="page-header">
        <div style={{ flex: 1, minWidth: 260 }}>
          <h1>{title}</h1>
          {sub && <p className="sub">{sub}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </div>
  )
}

export function Card({ title, sub, actions, children, tight, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions || sub) && (
        <div className="card-head">
          <div className="card-head-title">
            <h2>{title}</h2>
            {sub && <span className="sub">{sub}</span>}
          </div>
          {actions && <div className="card-head-actions">{actions}</div>}
        </div>
      )}
      <div className={tight ? 'card-body-tight' : 'card-body'}>{children}</div>
    </section>
  )
}

export function StatCard({ label, value, meta, accent = true }) {
  return (
    <div className="card stat-card">
      {accent && <span className="accent-bar" aria-hidden="true" />}
      <span className="label">{label}</span>
      <span className="value">{value}</span>
      {meta && <span className="meta">{meta}</span>}
    </div>
  )
}

export function Badge({ tone = 'neutral', children, className = '', style }) {
  return (
    <span className={`badge badge-${tone} ${className}`} style={style}>
      {children}
    </span>
  )
}

export function riskTone(band) {
  const b = String(band || '').toLowerCase()
  return b === 'high' ? 'bad' : b === 'medium' ? 'warn' : 'ok'
}

export function Loading({ label = 'Loading' }) {
  return (
    <div className="spinner-wrap" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}...</span>
    </div>
  )
}

export function EmptyState({ icon: Icon = Inbox, title, children, action }) {
  return (
    <div className="empty-state">
      {Icon && <Icon className="icon" size={36} strokeWidth={1.5} aria-hidden="true" />}
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action && <div className="mt-16">{action}</div>}
    </div>
  )
}

export function ErrorEmpty({ title = 'Not enough data yet', children }) {
  return (
    <EmptyState icon={AlertTriangle} title={title}>
      {children}
    </EmptyState>
  )
}

export function MasteryRow({ name, value }) {
  const v = value != null ? Math.round(value) : null
  const band = v == null
    ? { key: 'none', label: 'Not assessed' }
    : v >= 70
      ? { key: 'ok', label: 'Mastered' }
      : v >= 40
        ? { key: 'warn', label: 'Developing' }
        : { key: 'bad', label: 'Needs work' }

  return (
    <div className="mastery-row">
      <span className="t" title={name}>{name}</span>
      <div
        className={`progress ${band.key === 'none' ? '' : band.key}`}
        role="progressbar"
        aria-valuenow={v || 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${name}: ${v == null ? 'not assessed' : v + '% - ' + band.label}`}
      >
        {v != null && <span style={{ width: `${Math.min(100, Math.max(0, v))}%` }} />}
      </div>
      <span className="v">{v == null ? 'N/A' : `${v}%`}</span>
    </div>
  )
}

export function Field({ label, error, hint, children, htmlFor }) {
  return (
    <div className="field">
      {label && <label htmlFor={htmlFor}>{label}</label>}
      {children}
      {hint && !error && <span className="field-hint" id={htmlFor ? `${htmlFor}-hint` : undefined}>{hint}</span>}
      {error && <span className="field-error" id={htmlFor ? `${htmlFor}-error` : undefined} role="alert">{error}</span>}
    </div>
  )
}

export function Tabs({ tabs, active, onChange, label = 'Sections' }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          type="button"
          aria-selected={active === t.id}
          className="tab-btn"
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function Crumb({ to, children }) {
  return (
    <div className="crumb-nav">
      <Link to={to} className="crumb-link">
        <ChevronLeft size={16} aria-hidden="true" />
        <span>{children}</span>
      </Link>
    </div>
  )
}

export function ScoreBadge({ score, total }) {
  const pct = Math.round((100 * score) / total)
  const tone = pct >= 70 ? 'ok' : pct >= 40 ? 'warn' : 'bad'
  return <Badge tone={tone}>{pct}% ({score}/{total})</Badge>
}

export { Loader2 }
