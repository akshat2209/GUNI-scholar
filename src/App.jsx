import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth, roleHome } from './context/AuthContext'
import { Loading } from './components/ui'
import DashboardLayout from './components/Layout'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Privacy from './pages/legal/Privacy'
import Terms from './pages/legal/Terms'
import NotFound from './pages/NotFound'

import StudentDashboard from './pages/student/Dashboard'
import StudentCourses from './pages/student/Courses'
import StudentAssignments from './pages/student/Assignments'
import StudentAssessments from './pages/student/Assessments'
import StudentAnalytics from './pages/student/Analytics'
import KnowledgeMap from './pages/student/KnowledgeMap'
import StudyPlan from './pages/student/StudyPlan'

import FacultyDashboard from './pages/faculty/Dashboard'
import FacultyCourses from './pages/faculty/Courses'
import FacultyAssignments from './pages/faculty/Assignments'
import FacultyAssessments from './pages/faculty/Assessments'
import FacultyEvaluation from './pages/faculty/Evaluation'
import FacultyStudents from './pages/faculty/Students'
import FacultyHeatmap from './pages/faculty/Heatmap'

import DeanDashboard from './pages/dean/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminCourses from './pages/admin/Courses'

function RequireRole({ role, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-app)' }}>
        <Loading label="Loading GUNI Scholar..." />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (role && user.role !== role) return <Navigate to={roleHome(user.role)} replace />
  return children
}

const guard = (role, el) => <RequireRole role={role}>{el}</RequireRole>

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/" element={<RootRedirect />} />

      <Route element={guard(null, <DashboardLayout />)}>
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route element={guard('student', <DashboardLayout />)}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<StudentCourses />} />
        <Route path="/student/courses/:courseId" element={<StudentCourses />} />
        <Route path="/student/assignments" element={<StudentAssignments />} />
        <Route path="/student/assignments/:assignmentId" element={<StudentAssignments />} />
        <Route path="/student/assessments" element={<StudentAssessments />} />
        <Route path="/student/assessments/:assessmentId" element={<StudentAssessments />} />
        <Route path="/student/analytics" element={<StudentAnalytics />} />
        <Route path="/student/analytics/:courseId" element={<StudentAnalytics />} />
        <Route path="/student/knowledge-map" element={<KnowledgeMap />} />
        <Route path="/student/knowledge-map/:courseId" element={<KnowledgeMap />} />
        <Route path="/student/study-plan" element={<StudyPlan />} />
      </Route>

      <Route element={guard('faculty', <DashboardLayout />)}>
        <Route path="/faculty" element={<FacultyDashboard />} />
        <Route path="/faculty/courses" element={<FacultyCourses />} />
        <Route path="/faculty/courses/:courseId" element={<FacultyCourses />} />
        <Route path="/faculty/assignments" element={<FacultyAssignments />} />
        <Route path="/faculty/assessments" element={<FacultyAssessments />} />
        <Route path="/faculty/evaluation" element={<FacultyEvaluation />} />
        <Route path="/faculty/students" element={<FacultyStudents />} />
        <Route path="/faculty/students/:studentId" element={<FacultyStudents />} />
        <Route path="/faculty/heatmap" element={<FacultyHeatmap />} />
      </Route>

      <Route element={guard('dean', <DashboardLayout />)}>
        <Route path="/dean" element={<DeanDashboard />} />
      </Route>

      <Route element={guard('admin', <DashboardLayout />)}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-app)' }}>
        <Loading label="Loading..." />
      </div>
    )
  }
  return <Navigate to={user ? roleHome(user.role) : '/login'} replace />
}
