import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <div className="legal-page">
      <img src="/logo-ganpat.png" alt="Ganpat University" width="190" style={{ marginBottom: 20 }} />
      <h1>Terms and Conditions</h1>
      <p className="updated">Last updated: 10 October 2026. Applies to the GUNI Scholar prototype.</p>

      <p>By accessing GUNI Scholar you agree to these terms. The platform is provided by Ganpat University for
      academic use by enrolled students, faculty and authorised staff.</p>

      <h2>1. Acceptable use</h2>
      <ul>
        <li>Use the platform only for lawful academic activity connected to your studies or teaching.</li>
        <li>Do not share your account credentials. You are responsible for activity under your account.</li>
        <li>Do not attempt to access records of courses you are not enrolled in or not teaching.</li>
        <li>Submitted work must follow the academic integrity policy of the university.</li>
      </ul>

      <h2>2. Roles and permissions</h2>
      <p>Access is role based. Students see their own courses, submissions and analytics. Faculty see the courses
      they teach and the students enrolled in them. The dean sees institute-level aggregates. Administrators manage
      accounts, roles and course structure. Attempting to circumvent these boundaries is a violation of these terms.</p>

      <h2>3. Academic records</h2>
      <p>Assignment and assessment records on the platform support, but do not replace, official examination
      records. Where a discrepancy exists, the official university record prevails. Faculty evaluations published
      on the platform are considered communicated to the student.</p>

      <h2>4. Availability</h2>
      <p>The platform is provided as a prototype for Hackathon 2026 and is offered as is, without warranty of
      uninterrupted availability. Scheduled maintenance will be announced on course dashboards.</p>

      <h2>5. Changes</h2>
      <p>Ganpat University may update these terms as the platform evolves. Continued use after an update
      constitutes acceptance of the revised terms.</p>

      <p className="mt-24"><Link to="/">Back to GUNI Scholar</Link></p>
    </div>
  )
}
