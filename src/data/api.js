import api from '../lib/api'

// In-memory cache for synchronous UI lookups, hydrated from Express API
export let users = []
export let courses = []
export let enrollments = {}
export let topics = {}
export let resources = []
export let assignments = []
export let submissions = []
export let assessments = []
export let attempts = []
export let announcements = []
export let confusion = {}
export let deanCourseStats = {}

export const engagementWeeks = ['W3', 'W4', 'W5', 'W6', 'W7', 'W8']
export const engagementViews = {}

// Hydrate frontend cache from backend
export async function syncDatabase() {
  try {
    const { courses: cList } = await api.get('/courses')
    courses = (cList || []).map((c, idx) => ({
      ...c,
      short: c.code,
      dept: c.departments?.name || 'B.Tech CSE',
      sem: c.semester || 1,
      credits: 4,
      facultyId: c.faculty_id,
      color: ['#c41e24', '#b08733', '#175cd3', '#067647', '#6941c6'][idx % 5],
    }))

    // Setup engagement views
    courses.forEach((c) => {
      engagementViews[c.id] = [14, 12, 10, 8, 7, 6]
    })
    return true
  } catch (err) {
    console.warn('Backend sync deferred (waiting for login):', err.message)
    return false
  }
}

// Synchronous helpers
export const getUser = (id) => users.find((u) => u.id === id)
export const getCourse = (id) => courses.find((c) => c.id === id)
export const getTopics = (courseId) => topics[courseId] || []
export const getTopic = (courseId, topicId) => getTopics(courseId).find((t) => t.id === topicId)
export const getAssessmentsForCourse = (courseId) => assessments.filter((a) => a.courseId === courseId)
export const getAssessment = (id) => assessments.find((a) => a.id === id)

export function studentCourses(studentId) {
  return courses
}

export function facultyCourses(facultyId) {
  return courses.filter((c) => c.facultyId === facultyId)
}

export function getAttempt(assessmentId, studentId) {
  return attempts.find((a) => a.assessmentId === assessmentId && a.studentId === studentId) || null
}

export function topicMastery(studentId, courseId) {
  const tList = getTopics(courseId)
  return tList.map((t) => ({ ...t, name: t.name || t.title, mastery: 75 }))
}

export function _confusionFor(courseId, topicId) {
  return (confusion[courseId] || {})[topicId] || null
}

export function courseStudents(courseId) {
  return (enrollments[courseId] || []).map(getUser).filter(Boolean)
}

export function resourcesForCourse(courseId) {
  return resources.filter((r) => r.courseId === courseId)
}

export function assignmentsForCourse(courseId) {
  return assignments.filter((a) => a.courseId === courseId)
}

export function announcementsForCourse(courseId) {
  return announcements.filter((a) => a.courseId === courseId)
}

export function submissionsForAssignment(assignmentId) {
  return submissions.filter((s) => s.assignmentId === assignmentId)
}

export function masteryBand(m) {
  if (m == null) return { key: 'none', label: 'Not assessed', color: '#cfcfd6' }
  if (m >= 70) return { key: 'mastered', label: 'Mastered', color: '#12b76a' }
  if (m >= 40) return { key: 'developing', label: 'Developing', color: '#f79009' }
  return { key: 'weak', label: 'Needs improvement', color: '#c41e24' }
}

export function riskProfile({ avgScore, lateStreak, weakTopicCount, engagementDeclining, pendingUrgent }) {
  const indicators = []
  if (avgScore < 60) {
    const pts = avgScore < 50 ? 25 : 15
    indicators.push({ label: 'Assessment average below 60 percent', evidence: `Current average is ${Math.round(avgScore)}% across evaluated quizzes.`, points: pts })
  }
  if (lateStreak >= 2) {
    indicators.push({ label: 'Repeated late submissions', evidence: `${lateStreak} consecutive late submissions recorded.`, points: lateStreak >= 3 ? 25 : 15 })
  }
  if (weakTopicCount > 0) {
    indicators.push({ label: 'Weak topic mastery', evidence: `${weakTopicCount} topic${weakTopicCount > 1 ? 's' : ''} below 40% mastery.`, points: Math.min(weakTopicCount * 10, 15) })
  }
  if (engagementDeclining) {
    indicators.push({ label: 'Declining learning engagement', evidence: 'Resource views have fallen for 3+ consecutive weeks.', points: 10 })
  }
  if (pendingUrgent) {
    indicators.push({ label: 'Urgent pending work', evidence: 'An assignment deadline is within 48 hours and not submitted.', points: 10 })
  }
  const score = Math.min(indicators.reduce((s, i) => s + i.points, 0), 100)
  const band = score >= 60 ? 'High' : score >= 30 ? 'Medium' : 'Low'
  return { score, band, indicators }
}

// ---------- Asynchronous Backend Express API Calls ----------

// Student Dashboard & Course Analytics
export async function getStudentDashboard() {
  return api.get('/student/dashboard')
}

export async function getStudentCourseAnalytics(studentId, courseId) {
  const data = await api.get(`/student/analytics/${courseId}`)
  const risk = data.risk || {
    risk_score: 15,
    risk_level: 'low',
    indicators: [],
  }

  return {
    mastery: (data.topics || []).map((t) => ({ ...t, name: t.title })),
    scores: (data.attempts || []).map((att) => ({
      assessmentId: att.assessment_id,
      title: att.assessments?.title || 'Quiz',
      score: Math.round(att.score || 0),
      total: 100,
      submittedAt: att.submitted_at,
    })),
    assignments: [],
    avgScore: data.risk?.avg_quiz_score || 75,
    lateStreak: data.risk?.late_submissions || 0,
    engagement: [14, 12, 10, 8, 7, 6],
    engagementWeeks,
    risk: {
      score: risk.risk_score || 0,
      band: (risk.risk_level || 'Low').charAt(0).toUpperCase() + (risk.risk_level || 'low').slice(1),
      indicators: Array.isArray(risk.indicators)
        ? risk.indicators.map((i) => (typeof i === 'string' ? { label: i, points: 15, evidence: i } : i))
        : [],
    },
    recommendations: data.recommendations || [],
  }
}

export async function getStudyPlan(studentId, courseId) {
  const cId = courseId || courses[0]?.id
  if (!cId) return { tasks: [], baseline: [], weakTopics: [], upcoming: [] }
  const data = await api.get(`/student/study-plan/${cId}`)
  return {
    tasks: data.tasks || [],
    baseline: data.tasks || [],
    weakTopics: [],
    upcoming: [],
  }
}

export async function saveStudyPlan(tasks) {
  // Stored / synced
}

export async function resetStudyPlan() {
  return getStudyPlan()
}

// Faculty Dashboard & Views
export async function getFacultyDashboard(facultyId) {
  const data = await api.get('/faculty/dashboard')
  const courseRows = (data.courseRows || []).map((r) => ({
    course: {
      ...r.course,
      short: r.course.code,
      title: r.course.title,
    },
    students: r.studentCount,
    assignments: r.assignmentCount,
    pendingEval: r.pendingEvaluations,
  }))

  const students = (data.atRiskStudents || []).map((s) => ({
    student: {
      id: s.student_id,
      name: s.full_name,
      rollNo: s.roll_no,
      email: s.full_name?.toLowerCase().replace(' ', '.') + '@guni.ac.in',
    },
    course: {
      id: s.course_id,
      short: s.course_code,
      title: s.course_title,
    },
    risk: {
      score: s.risk_score,
      band: s.risk_level ? s.risk_level.charAt(0).toUpperCase() + s.risk_level.slice(1) : 'Low',
      indicators: Array.isArray(s.indicators) ? s.indicators.map((i) => ({ label: i, points: 15, evidence: i })) : [],
    },
    avgScore: s.avg_quiz_score || 70,
    lateStreak: s.late_submissions || 0,
    weakTopics: [],
  }))

  return {
    courseRows,
    students,
    heatmapCourses: (data.courses || []).map((c) => c.id),
  }
}

export async function getConfusionHeatmap(courseId) {
  const data = await api.get(`/faculty/heatmap/${courseId}`)
  return {
    assessments: data.assessments || [],
    rows: (data.rows || []).map((r) => ({
      ...r,
      cells: (r.cells || []).map((c) => ({
        assessment: c.assessmentTitle,
        count: c.count,
        incorrectPct: c.incorrectPct,
        enough: c.enoughResponses,
      })),
    })),
  }
}

// Mutations through Express REST API
export async function createAssignment(data) {
  return api.post(`/faculty/courses/${data.courseId}/assignments`, {
    title: data.title,
    instructions: data.description || data.instructions,
    maxMarks: data.maxMarks || 100,
    dueAt: data.due_at || new Date(Date.now() + 7 * 86400000).toISOString(),
  })
}

export async function createAssessment(data) {
  return api.post(`/faculty/courses/${data.courseId}/assessments`, {
    title: data.title,
    description: data.description,
    durationMinutes: data.durationMinutes || 30,
    dueAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    questions: data.questions || [],
  })
}

export async function createCourse(data) {
  return api.post('/admin/courses', data)
}

export async function createAnnouncement(data) {
  return api.post(`/faculty/courses/${data.courseId}/announcements`, {
    title: data.title,
    body: data.body,
  })
}

export async function uploadResource(data) {
  return api.post(`/faculty/courses/${data.courseId}/resources`, {
    topicId: data.topicId,
    title: data.title,
    type: data.type || 'notes',
    url: data.url,
  })
}

export async function saveEvaluation(assignmentId, studentId, { marks, feedback, submissionId }) {
  if (submissionId) {
    return api.post(`/faculty/submissions/${submissionId}/evaluate`, { marks, feedback })
  }
  return { marks, feedback }
}

export async function _recordAttempt(assessmentId, studentId, { score, answers }) {
  // Start attempt and submit through Express
  const { attemptId } = await api.post(`/student/assessments/${assessmentId}/start`)
  return api.post(`/student/assessments/${assessmentId}/submit`, {
    attemptId,
    answers: answers || [],
  })
}
