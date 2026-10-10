# GUNI Scholar

Intelligent Faculty-Student Academic Collaboration Platform for Ganpat University.
Prototype built for Hackathon 2026.

## What it does

Educational institutions run study material, assignments, assessments, announcements and performance
tracking in separate systems. GUNI Scholar unifies them and adds an analytics layer:

- **Unified academic management**: courses, topic-tagged resources, assignments and quizzes in one place.
- **Learning analytics**: topic-wise mastery (quizzes 60 percent, assignments 40 percent), score history
  and engagement trends per student.
- **Explainable academic risk detection**: an additive model over five indicators, assessment average,
  late-submission streak, weak topic count, declining engagement and urgent pending work. Every score is
  traceable to its evidence; no single exam decides it.
- **Personalised learning**: recommendations and a smart study plan generated from weak topics and their
  prerequisites, respecting upcoming deadlines.
- **Faculty and dean insight**: anonymous class confusion heatmap, risk alerts with interventions, and
  institute-level course analytics.

## Demo accounts

Password for every account: `guni123`

| Role | Email |
|------|-------|
| Student | aarav.shah@ganpatuni.ac.in |
| Faculty | nirav.bhatt@ganpatuni.ac.in |
| Dean | kalpesh.patel@ganpatuni.ac.in |
| Admin | sneha.kulkarni@ganpatuni.ac.in |

The seeded student demonstrates the scenario from the problem statement: 52 percent assessment average in
DAA, three consecutive late submissions, weak Dynamic Programming and Graph Theory mastery, which drives a
high risk band, memoisation recommendations and a faculty alert suggesting one-on-one tutoring.

## Setup

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build
```

Requires Node 18 or later. The prototype is fully self-contained: the data layer in `src/data/mock.js`
runs in memory with simulated latency, so no backend or database is needed for the demo.

## Architecture

```
src/
  components/     Layout, design-system components, charts, knowledge graph, heatmap
  context/        Auth (session + RBAC), toasts
  data/
    mock.js       Seeded dataset: users, courses, topics, attempts, submissions
    api.js        Analytics layer: mastery, risk model, heatmap aggregation, study plan
  pages/
    student/      Dashboard, courses, assignments, quizzes, analytics, knowledge map, study plan
    faculty/      Dashboard, course mgmt, assignment and quiz builders, evaluation, students, heatmap
    dean/         Institute-level overview
    admin/        Accounts, roles, courses, enrollments
    legal/        Privacy policy, terms and conditions
```

Role-based access control is enforced at the router: each route requires a signed-in user of the right
role and redirects otherwise. Analytics run client-side over the mock dataset with the same function
shapes a FastAPI or Node backend would expose.

## Tech stack

React 18, React Router 6, Recharts, Lucide icons, Vite. Institutional design system built on the Ganpat
University brand (red #C41E24 / #EB2B30, NAAC gold #B08733), responsive from 360 px to 4K, targeting
WCAG 2.1 AA: keyboard navigation, visible focus, labelled forms, live regions for toasts and alerts,
reduced-motion support.

## Known prototype limits

- Data is in memory and resets on reload; changes (new assignments, evaluations, study plan progress)
  persist only for the session, study plan progress in localStorage.
- Resource open/download shows the workflow but does not stream real files.
- A mobile app demonstration can reuse this design with React Native.
