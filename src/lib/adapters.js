import { supabase } from './supabase'
import api from './api'

/**
 * ADAPTERS FOR SUPABASE LIVE DATABASE & BACKEND REST API
 * All queries adhere strictly to verified database schema and RLS policies.
 */

// ==========================================
// 1. STUDENT DATA ADAPTERS
// ==========================================

export async function getStudentCourses(studentId) {
  try {
    const { data: enrolls, error } = await supabase
      .from('enrollments')
      .select('course_id, courses(*, profiles!courses_faculty_id_fkey(full_name, email), departments(code, name))')
      .eq('student_id', studentId)
      .eq('status', 'active')

    if (error) throw error
    return (enrolls || []).map((e) => e.courses).filter(Boolean)
  } catch (err) {
    console.warn('getStudentCourses fallback to API:', err.message)
    const res = await api.get('/student/courses')
    return res.courses || []
  }
}

export async function getStudentCourseDetail(courseId) {
  try {
    const [courseRes, topicsRes, resourcesRes, announcementsRes] = await Promise.all([
      supabase
        .from('courses')
        .select('*, profiles!courses_faculty_id_fkey(full_name, email), departments(code, name)')
        .eq('id', courseId)
        .single(),
      supabase
        .from('topics')
        .select('id, title, description, order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true }),
      supabase
        .from('resources')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false }),
      supabase
        .from('announcements')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false }),
    ])

    return {
      course: courseRes.data,
      topics: topicsRes.data || [],
      resources: resourcesRes.data || [],
      announcements: announcementsRes.data || [],
    }
  } catch (err) {
    console.warn('getStudentCourseDetail fallback to API:', err.message)
    return api.get(`/student/courses/${courseId}`)
  }
}

export async function getStudentDashboardData(studentId) {
  try {
    const [courses, riskRowsRes, asgRes, subRes] = await Promise.all([
      getStudentCourses(studentId),
      supabase.from('v_student_risk').select('*').eq('student_id', studentId),
      supabase.from('assignments').select('*, courses(code, title)').eq('published', true).order('due_at', { ascending: true }),
      supabase.from('submissions').select('assignment_id, status, marks, feedback, submitted_at, file_path').eq('student_id', studentId),
    ])

    const subMap = Object.fromEntries((subRes.data || []).map((s) => [s.assignment_id, s]))
    const upcomingAssignments = (asgRes.data || []).map((a) => ({
      ...a,
      submission: subMap[a.id] || null,
    }))

    return {
      courses,
      upcomingAssignments,
      riskProfiles: riskRowsRes.data || [],
    }
  } catch (err) {
    console.warn('getStudentDashboardData fallback to API:', err.message)
    return api.get('/student/dashboard')
  }
}

export async function getStudentAnalyticsData(studentId, courseId) {
  try {
    const [topicsRes, masteryRes, attemptsRes, riskRes] = await Promise.all([
      supabase.from('topics').select('id, title, course_id, order_index').eq('course_id', courseId).order('order_index', { ascending: true }),
      supabase.from('topic_mastery').select('topic_id, mastery_score').eq('student_id', studentId),
      supabase
        .from('attempts')
        .select('id, score, started_at, submitted_at, assessment_id, assessments(id, title, course_id)')
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: true }),
      supabase.from('v_student_risk').select('*').eq('student_id', studentId).eq('course_id', courseId).maybeSingle(),
    ])

    const masteryMap = Object.fromEntries((masteryRes.data || []).map((m) => [m.topic_id, m.mastery_score]))
    const courseAttempts = (attemptsRes.data || []).filter((a) => a.assessments?.course_id === courseId)

    const topics = (topicsRes.data || []).map((t) => ({
      ...t,
      mastery: masteryMap[t.id] != null ? Math.round(masteryMap[t.id]) : 75,
    }))

    return {
      topics,
      attempts: courseAttempts,
      risk: riskRes.data || {
        risk_score: 15,
        risk_level: 'low',
        indicators: [],
        avg_quiz_score: 75,
        late_submissions: 0,
      },
      recommendations: [],
    }
  } catch (err) {
    console.warn('getStudentAnalyticsData fallback to API:', err.message)
    return api.get(`/student/analytics/${courseId}`)
  }
}

export async function getKnowledgeMapData(studentId, courseId) {
  try {
    const [topicsRes, prereqsRes, masteryRes, courseDetail] = await Promise.all([
      supabase.from('topics').select('id, title, order_index').eq('course_id', courseId).order('order_index', { ascending: true }),
      supabase.from('topic_prerequisites').select('topic_id, prerequisite_topic_id'),
      supabase.from('topic_mastery').select('topic_id, mastery_score').eq('student_id', studentId),
      getStudentCourseDetail(courseId),
    ])

    const prereqMap = {}
    ;(prereqsRes.data || []).forEach((p) => {
      prereqMap[p.topic_id] = prereqMap[p.topic_id] || []
      prereqMap[p.topic_id].push(p.prerequisite_topic_id)
    })

    const masteryById = {}
    ;(masteryRes.data || []).forEach((m) => {
      masteryById[m.topic_id] = Math.round(m.mastery_score)
    })

    const topics = (topicsRes.data || []).map((t) => ({
      id: t.id,
      name: t.title,
      short: t.title.split(' ')[0],
      prereqs: prereqMap[t.id] || [],
    }))

    return {
      topics,
      masteryById,
      resources: courseDetail.resources || [],
    }
  } catch (err) {
    console.warn('getKnowledgeMapData fallback:', err.message)
    return { topics: [], masteryById: {}, resources: [] }
  }
}

export async function getStudentStudyPlan(studentId, courseId) {
  try {
    let { data: plan } = await supabase
      .from('study_plans')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .maybeSingle()

    let tasks = []
    if (plan) {
      const { data: tList } = await supabase
        .from('study_plan_tasks')
        .select('*, topics(title)')
        .eq('plan_id', plan.id)
        .order('order_index', { ascending: true })
      tasks = tList || []
    }

    return { plan, tasks }
  } catch (err) {
    console.warn('getStudentStudyPlan fallback to API:', err.message)
    return api.get(`/student/study-plan/${courseId}`)
  }
}

export async function updateStudyPlanTask(taskId, newStatus) {
  const completedAt = newStatus === 'completed' ? new Date().toISOString() : null
  const { data, error } = await supabase
    .from('study_plan_tasks')
    .update({ status: newStatus, completed_at: completedAt })
    .eq('id', taskId)
    .select()

  if (error) {
    // Fallback to Express endpoint
    return api.patch(`/student/study-plan/tasks/${taskId}`, { status: newStatus })
  }
  return data
}

export async function submitAssignment({ studentId, assignmentId, filePath, notes, dueAt }) {
  const isLate = dueAt && new Date() > new Date(dueAt)
  const status = isLate ? 'late' : 'submitted'

  // Insert or update submission row
  const { data, error } = await supabase
    .from('submissions')
    .upsert(
      {
        assignment_id: assignmentId,
        student_id: studentId,
        file_path: filePath,
        notes: notes || null,
        submitted_at: new Date().toISOString(),
        status,
      },
      { onConflict: 'assignment_id,student_id' },
    )
    .select()
    .single()

  if (error) {
    // Fallback to Express endpoint
    return api.post(`/student/assignments/${assignmentId}/submit`, { filePath, notes })
  }
  return data
}

// ==========================================
// 2. FACULTY DATA ADAPTERS
// ==========================================

export async function getFacultyCourses(facultyId) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*, departments(code, name)')
      .eq('faculty_id', facultyId)
      .order('code', { ascending: true })

    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('getFacultyCourses fallback to API:', err.message)
    const res = await api.get('/faculty/courses')
    return res.courses || []
  }
}

export async function getFacultyCourseDetail(courseId) {
  try {
    const [courseRes, topicsRes, resourcesRes, announcementsRes, enrollsRes, asgsRes] = await Promise.all([
      supabase.from('courses').select('*, departments(code, name)').eq('id', courseId).single(),
      supabase.from('topics').select('*').eq('course_id', courseId).order('order_index', { ascending: true }),
      supabase.from('resources').select('*').eq('course_id', courseId).order('created_at', { ascending: false }),
      supabase.from('announcements').select('*').eq('course_id', courseId).order('created_at', { ascending: false }),
      supabase.from('enrollments').select('student_id, profiles!enrollments_student_id_fkey(id, full_name, email, roll_no)').eq('course_id', courseId),
      supabase.from('assignments').select('*, submissions(id, status, marks, submitted_at)').eq('course_id', courseId),
    ])

    const students = (enrollsRes.data || []).map((e) => e.profiles).filter(Boolean)

    return {
      course: courseRes.data,
      topics: topicsRes.data || [],
      resources: resourcesRes.data || [],
      announcements: announcementsRes.data || [],
      students,
      assignments: asgsRes.data || [],
    }
  } catch (err) {
    console.warn('getFacultyCourseDetail fallback to API:', err.message)
    return api.get(`/faculty/courses/${courseId}`)
  }
}

export async function getConfusionHeatmap(courseId) {
  try {
    const { data: rows, error } = await supabase
      .from('v_confusion_heatmap')
      .select('*')
      .eq('course_id', courseId)

    if (error) throw error

    // Transform into matrix format: assessments columns, topic rows
    const assessmentSet = new Map()
    const topicMap = new Map()

    ;(rows || []).forEach((r) => {
      if (r.assessment_title) {
        assessmentSet.set(r.assessment_id, r.assessment_title)
      }
      if (!topicMap.has(r.topic_id)) {
        topicMap.set(r.topic_id, {
          topic: { id: r.topic_id, title: r.topic_title },
          byAssessment: {},
          totalResponses: 0,
          totalIncorrect: 0,
        })
      }
      const tData = topicMap.get(r.topic_id)
      tData.byAssessment[r.assessment_id] = {
        assessment: r.assessment_title,
        assessmentTitle: r.assessment_title,
        count: r.total_responses || 0,
        incorrectPct: r.incorrect_pct != null ? Math.round(r.incorrect_pct) : 0,
        enough: (r.total_responses || 0) >= 3,
        enoughResponses: (r.total_responses || 0) >= 3,
      }
      tData.totalResponses += r.total_responses || 0
      tData.totalIncorrect += r.incorrect_responses || 0
    })

    const assessments = Array.from(assessmentSet.values())
    const assessmentIds = Array.from(assessmentSet.keys())

    const matrixRows = Array.from(topicMap.values()).map((t) => {
      const cells = assessmentIds.map((aId) => {
        return (
          t.byAssessment[aId] || {
            assessment: assessmentSet.get(aId),
            assessmentTitle: assessmentSet.get(aId),
            count: 0,
            incorrectPct: null,
            enough: false,
            enoughResponses: false,
          }
        )
      })

      const avgIncorrectPct =
        t.totalResponses > 0 ? Math.round((100 * t.totalIncorrect) / t.totalResponses) : null

      return {
        topic: t.topic,
        cells,
        totalResponses: t.totalResponses,
        avgIncorrectPct,
      }
    })

    // Sort by error rate descending
    matrixRows.sort((a, b) => (b.avgIncorrectPct || 0) - (a.avgIncorrectPct || 0))

    return {
      assessments,
      rows: matrixRows,
    }
  } catch (err) {
    console.warn('getConfusionHeatmap fallback to API:', err.message)
    return api.get(`/faculty/heatmap/${courseId}`)
  }
}

export async function getFacultyStudentsRoster(facultyId) {
  try {
    const { data: courses } = await supabase.from('courses').select('id, code, title').eq('faculty_id', facultyId)
    const courseIds = (courses || []).map((c) => c.id)

    if (!courseIds.length) return []

    const { data: riskRows, error } = await supabase
      .from('v_student_risk')
      .select('*')
      .in('course_id', courseIds)

    if (error) throw error

    return (riskRows || []).map((r) => {
      const band = r.risk_level ? r.risk_level.charAt(0).toUpperCase() + r.risk_level.slice(1) : 'Low'
      return {
        student: {
          id: r.student_id,
          name: r.full_name,
          rollNo: r.roll_no,
          email: r.full_name?.toLowerCase().replace(' ', '.') + '@guni.ac.in',
        },
        course: {
          id: r.course_id,
          code: r.course_code,
          title: r.course_title,
        },
        risk: {
          score: r.risk_score || 0,
          band,
          indicators: Array.isArray(r.indicators) ? r.indicators : [],
        },
        avgScore: Math.round(r.avg_quiz_score || 70),
        lateStreak: r.late_submissions || 0,
      }
    })
  } catch (err) {
    console.warn('getFacultyStudentsRoster fallback to API:', err.message)
    const res = await api.get('/faculty/students')
    return res.students || []
  }
}

export async function evaluateSubmission(submissionId, { marks, feedback }) {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .update({
        marks: Number(marks),
        feedback: feedback ? feedback.trim() : null,
        status: 'evaluated',
        evaluated_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
      .select('*, profiles!submissions_student_id_fkey(full_name, email, roll_no)')
      .single()

    if (error) throw error
    return { submission: data }
  } catch (err) {
    return api.post(`/faculty/submissions/${submissionId}/evaluate`, { marks, feedback })
  }
}
