import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="legal-page">
      <img src="/logo-ganpat.png" alt="Ganpat University" width="190" style={{ marginBottom: 20 }} />
      <h1>Privacy Policy</h1>
      <p className="updated">Last updated: 10 October 2026. Applies to the GUNI Scholar prototype.</p>

      <p>GUNI Scholar is the academic collaboration platform of Ganpat University. This policy explains what
      information the platform processes, why it is processed, and the choices available to users.</p>

      <h2>1. Information we process</h2>
      <ul>
        <li><strong>Account details:</strong> name, university email, roll or staff number, department, semester and role.</li>
        <li><strong>Academic activity:</strong> course enrollments, study material access, assignment submissions, assessment attempts and faculty evaluations.</li>
        <li><strong>Derived analytics:</strong> topic mastery estimates, engagement trends and the academic risk indicators computed from the activity above.</li>
      </ul>

      <h2>2. Why we process it</h2>
      <ul>
        <li>To operate course, assignment and assessment workflows for students and faculty.</li>
        <li>To generate personalised learning recommendations and study plans for students.</li>
        <li>To give faculty and the dean aggregate, actionable insight into class learning progress.</li>
      </ul>

      <h2>3. Anonymity in analytics</h2>
      <p>Class-level views such as the confusion heatmap show only aggregate percentages and response counts.
      Faculty risk views are limited to the faculty members who teach the student. Individual identity is never
      exposed in course-wide or institute-wide aggregates.</p>

      <h2>4. Data retention</h2>
      <p>Academic records are retained for the duration of the program in which a student is enrolled and for the
      period required by university examination policy afterwards. Prototype demonstration data is reset when the
      demonstration environment is refreshed.</p>

      <h2>5. Your choices</h2>
      <ul>
        <li>You may view your own profile and analytics at any time from the profile page.</li>
        <li>You may request correction of account details through the administration office.</li>
        <li>Faculty access to student records is restricted by role and course assignment.</li>
      </ul>

      <h2>6. Contact</h2>
      <p>Questions about this policy can be directed to the Computer Engineering department office,
      Ganpat University, Kherva, Mehsana, Gujarat 384012.</p>

      <p className="mt-24"><Link to="/">Back to GUNI Scholar</Link></p>
    </div>
  )
}
