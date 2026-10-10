import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, Lock, Mail } from 'lucide-react'
import { useAuth, roleHome } from '../context/AuthContext'
import { Field } from '../components/ui'

const DEMO_PASSWORD = 'Demo@123'

const DEMO = [
  { role: 'Student', email: 'aarav.shah@guni.ac.in' },
  { role: 'Faculty', email: 'meera.patel@guni.ac.in' },
  { role: 'Dean', email: 'dean@guni.ac.in' },
  { role: 'Admin', email: 'admin@guni.ac.in' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [pwValue, setPwValue] = useState('')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid university email address.'
    if (pwValue.length < 6) errs.pw = 'Password must be at least 6 characters.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      const user = await login(email, pwValue)
      navigate(location.state?.from && user.role === 'student' ? location.state.from : roleHome(user.role), { replace: true })
    } catch (err) {
      setErrors({ form: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-form-pane">
        <form className="login-card" onSubmit={submit} noValidate>
          <img src="/logo-ganpat.png" alt="Ganpat University" width="220" style={{ marginBottom: 24 }} />
          <h1>Sign in to GUNI Scholar</h1>
          <p className="sub">Use your Ganpat University credentials to access your courses, assignments and learning analytics.</p>

          {errors.form && (
            <div className="alert alert-bad mb-16" role="alert">
              <div className="alert-body"><strong>Sign in failed</strong>{errors.form}</div>
            </div>
          )}

          <Field label="University email" htmlFor="email" error={errors.email}>
            <div className="icon-input">
              <Mail aria-hidden="true" />
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                placeholder="name@guni.ac.in"
              />
            </div>
          </Field>
          <Field label="Password" htmlFor="pw" error={errors.pw}>
            <div className="icon-input">
              <Lock aria-hidden="true" />
              <input
                id="pw"
                className="input"
                type="password"
                autoComplete="current-password"
                value={pwValue}
                onChange={(e) => setPwValue(e.target.value)}
                aria-invalid={!!errors.pw}
                aria-describedby={errors.pw ? 'pw-error' : undefined}
                placeholder="Enter your password"
              />
            </div>
          </Field>

          <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={busy}>
            {busy ? 'Authenticating...' : 'Sign in to GUNI Scholar'}
          </button>

          <div className="demo-accounts">
            <p className="hint">Quick Demo Accounts. Click any role to auto-fill:</p>
            <div className="demo-chips">
              {DEMO.map((d) => (
                <button
                  key={d.role}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setEmail(d.email); setPwValue(DEMO_PASSWORD); setErrors({}) }}
                  aria-label={`Fill Supabase credentials for ${d.role}`}
                >
                  {d.role}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      <aside className="login-brand-pane">
        <img className="logo-img" src="/logo-ganpat-naac.png" alt="Ganpat University, NAAC A plus accredited" width="230" />
        <div>
          <h1>GUNI Scholar</h1>
          <p className="lede">
            Intelligent Faculty-Student Academic Collaboration Platform powered by live university database.
          </p>
          <ul className="login-points">
            <li><CheckCircle2 aria-hidden="true" /> Track real courses, deadlines and submissions from Supabase</li>
            <li><CheckCircle2 aria-hidden="true" /> Topic-wise mastery computed from real assessment attempts</li>
            <li><CheckCircle2 aria-hidden="true" /> Personalised study plans built from your weak topics</li>
            <li><CheckCircle2 aria-hidden="true" /> Faculty and dean dashboards with live class insights</li>
          </ul>
        </div>
        <div className="login-foot">
          <span>Ganpat University · Supabase Live DB</span>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms and Conditions</Link>
        </div>
      </aside>
    </div>
  )
}
