import { Router } from 'express'
import { z } from 'zod'
import { supabaseAdmin } from '../config/supabase.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'

export const facultyRouter = Router()

facultyRouter.use(requireAuth, requireRole('faculty'))

// Helper: check if faculty teaches this course
async function checkFacultyCourseOwnership(facultyId, courseId) {
  const { data } = await supabaseAdmin
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('faculty_id', facultyId)
    .maybeSingle()
  return !!data
}

// 1. GET /api/faculty/dashboard
facultyRouter.get('/dashboard', async (req, res) => {
  try {
    const facultyId = req.user.id

    // Taught courses
    const { data: myCourses } = await supabaseAdmin
      .from('courses')
      .select('*, departments(code, name)')
      .eq('faculty_id', facultyId)

    const courseIds = (myCourses || []).map((c) => c.id)

    if (!courseIds.length) {
      return res.json({
        faculty: req.user,
        courses: [],
        courseRows: [],
        atRiskStudents: [],
        pendingEvaluationsCount: 0,
      })
    }

    // Enrollments
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('student_id, course_id')
      .in('course_id', courseIds)
      .eq('status', 'active')

    // Assignments
    const { data: assignments } = await supabaseAdmin
      .from('assignments')
      .select('id, course_id')
      .in('course_id', courseIds)

    const asgIds = (assignments || []).map((a) => a.id)

    // Pending evaluations
    const { data: submissions } = await supabaseAdmin
      .from('submissions')
      .select('id, assignment_id, status')
      .in('assignment_id', asgIds.length ? asgIds : ['00000000-0000-0000-0000-000000000000'])
      .neq('status', 'evaluated')

    // Students at risk from view v_student_risk
    const { data: riskStudents } = await supabaseAdmin
      .from('v_student_risk')
      .select('*')
      .in('course_id', courseIds)
      .order('risk_score', { ascending: false })

    // Build course rows summary
    const courseRows = (myCourses || []).map((c) => {
      const studentCount = (enrollments || []).filter((e) => e.course_id === c.id).length
      const courseAsgs = (assignments || []).filter((a) => a.course_id === c.id).map((a) => a.id)
      const pendingCount = (submissions || []).filter((s) => courseAsgs.includes(s.assignment_id)).length
      return {
        course: c,
        studentCount,
        assignmentCount: courseAsgs.length,
        pendingEvaluations: pendingCount,
      }
    })

    return res.json({
      faculty: req.user,
      courses: myCourses || [],
      courseRows,
      atRiskStudents: riskStudents || [],
      pendingEvaluationsCount: submissions?.length || 0,
    })
  } catch (err) {
    console.error('faculty dashboard error:', err)
    return res.status(500).json({ error: 'Failed to load faculty dashboard' })
  }
})

// 2. GET /api/faculty/courses
facultyRouter.get('/courses', async (req, res) => {
  try {
    const facultyId = req.user.id
    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select('*, departments(code, name)')
      .eq('faculty_id', facultyId)

    if (error) throw error
    return res.json({ courses: courses || [] })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load faculty courses' })
  }
})

// 2b. GET /api/faculty/assignments - All assignments across faculty courses
facultyRouter.get('/assignments', async (req, res) => {
  try {
    const facultyId = req.user.id
    const { data: myCourses } = await supabaseAdmin
      .from('courses')
      .select('id, code, title')
      .eq('faculty_id', facultyId)

    const courseIds = (myCourses || []).map((c) => c.id)
    if (!courseIds.length) {
      return res.json({ assignments: [] })
    }

    const { data: asgs, error } = await supabaseAdmin
      .from('assignments')
      .select('*, courses(id, code, title)')
      .in('course_id', courseIds)
      .order('due_at', { ascending: false })

    if (error) throw error

    const asgIds = (asgs || []).map((a) => a.id)
    const { data: subs } = await supabaseAdmin
      .from('submissions')
      .select('id, assignment_id, status')
      .in('assignment_id', asgIds.length ? asgIds : ['00000000-0000-0000-0000-000000000000'])

    const enriched = (asgs || []).map((a) => {
      const relatedSubs = (subs || []).filter((s) => s.assignment_id === a.id)
      const pending = relatedSubs.filter((s) => s.status !== 'evaluated').length
      return {
        ...a,
        totalSubmissions: relatedSubs.length,
        pendingEvaluations: pending,
      }
    })

    return res.json({ assignments: enriched })
  } catch (err) {
    console.error('faculty assignments list error:', err)
    return res.status(500).json({ error: 'Failed to load faculty assignments' })
  }
})

// 2c. GET /api/faculty/assessments - All assessments across faculty courses
facultyRouter.get('/assessments', async (req, res) => {
  try {
    const facultyId = req.user.id
    const { data: myCourses } = await supabaseAdmin
      .from('courses')
      .select('id, code, title')
      .eq('faculty_id', facultyId)

    const courseIds = (myCourses || []).map((c) => c.id)
    if (!courseIds.length) {
      return res.json({ assessments: [] })
    }

    const [
      { data: assts, error: asstErr },
      { data: questions },
      { data: attempts },
    ] = await Promise.all([
      supabaseAdmin.from('assessments').select('*, courses(id, code, title)').in('course_id', courseIds).order('due_at', { ascending: false }),
      supabaseAdmin.from('questions').select('id, assessment_id'),
      supabaseAdmin.from('attempts').select('id, assessment_id'),
    ])

    if (asstErr) throw asstErr

    const enriched = (assts || []).map((a) => {
      const qCount = (questions || []).filter((q) => q.assessment_id === a.id).length
      const attCount = (attempts || []).filter((att) => att.assessment_id === a.id).length
      return {
        ...a,
        questionCount: qCount,
        attemptCount: attCount,
        published: !!a.published_at,
      }
    })

    return res.json({ assessments: enriched })
  } catch (err) {
    console.error('faculty assessments list error:', err)
    return res.status(500).json({ error: 'Failed to load faculty assessments' })
  }
})

// 2d. GET /api/faculty/students - All students across faculty courses with risk data
facultyRouter.get('/students', async (req, res) => {
  try {
    const facultyId = req.user.id
    const { data: myCourses } = await supabaseAdmin
      .from('courses')
      .select('id, code, title')
      .eq('faculty_id', facultyId)

    const courseIds = (myCourses || []).map((c) => c.id)
    if (!courseIds.length) {
      return res.json({ students: [] })
    }

    const [
      { data: enrolls },
      { data: riskRows },
      { data: topics },
      { data: mastery },
    ] = await Promise.all([
      supabaseAdmin.from('enrollments').select('student_id, course_id, profiles!enrollments_student_id_fkey(id, full_name, email, roll_no), courses(id, code, title)').in('course_id', courseIds).eq('status', 'active'),
      supabaseAdmin.from('v_student_risk').select('*').in('course_id', courseIds),
      supabaseAdmin.from('topics').select('id, course_id, title'),
      supabaseAdmin.from('topic_mastery').select('student_id, topic_id, mastery_score'),
    ])

    const courseMap = Object.fromEntries((myCourses || []).map((c) => [c.id, c]))

    const studentList = (enrolls || []).map((e) => {
      const student = e.profiles || { id: e.student_id, full_name: 'Student', email: '', roll_no: '' }
      const course = e.courses || courseMap[e.course_id] || { id: e.course_id, code: 'Course', title: 'Course' }
      const risk = (riskRows || []).find((r) => r.student_id === e.student_id && r.course_id === e.course_id)

      const sMastery = (mastery || []).filter((m) => m.student_id === e.student_id)
      const weakTopics = sMastery
        .filter((m) => m.mastery_score < 40)
        .map((m) => (topics || []).find((t) => t.id === m.topic_id)?.title)
        .filter(Boolean)

      const riskLevel = risk?.risk_level || 'low'
      const riskScore = risk?.risk_score != null ? risk.risk_score : 0

      return {
        student: {
          id: student.id,
          name: student.full_name,
          email: student.email,
          rollNo: student.roll_no,
        },
        course: {
          id: course.id,
          code: course.code,
          short: course.code,
          title: course.title,
        },
        risk: {
          score: riskScore,
          band: riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1),
          indicators: Array.isArray(risk?.indicators)
            ? risk.indicators.map((i) => (typeof i === 'string' ? { label: i, evidence: i, points: 15 } : { label: i.indicator || i.label, evidence: i.detail || i.evidence, points: i.weight || 15 }))
            : [],
        },
        avgScore: risk?.avg_quiz_score != null ? Math.round(risk.avg_quiz_score) : 75,
        lateStreak: risk?.late_submissions || 0,
        weakTopics,
      }
    })

    return res.json({ students: studentList })
  } catch (err) {
    console.error('faculty students list error:', err)
    return res.status(500).json({ error: 'Failed to load faculty students' })
  }
})

// 3. GET /api/faculty/courses/:courseId
facultyRouter.get('/courses/:courseId', async (req, res) => {
  try {
    const facultyId = req.user.id
    const { courseId } = req.params

    const isOwner = await checkFacultyCourseOwnership(facultyId, courseId)
    if (!isOwner) {
      return res.status(403).json({ error: 'Forbidden: You do not teach this course' })
    }

    const [
      { data: course },
      { data: topics },
      { data: resources },
      { data: assignments },
      { data: assessments },
      { data: announcements },
      { data: enrolls },
    ] = await Promise.all([
      supabaseAdmin.from('courses').select('*, departments(code, name)').eq('id', courseId).single(),
      supabaseAdmin.from('topics').select('*').eq('course_id', courseId).order('order_index', { ascending: true }),
      supabaseAdmin.from('resources').select('*').eq('course_id', courseId),
      supabaseAdmin.from('assignments').select('*').eq('course_id', courseId).order('due_at', { ascending: false }),
      supabaseAdmin.from('assessments').select('*').eq('course_id', courseId).order('due_at', { ascending: false }),
      supabaseAdmin.from('announcements').select('*').eq('course_id', courseId).order('created_at', { ascending: false }),
      supabaseAdmin.from('enrollments').select('student_id, profiles!enrollments_student_id_fkey(id, full_name, email, roll_no)').eq('course_id', courseId).eq('status', 'active'),
    ])

    return res.json({
      course,
      topics: topics || [],
      resources: resources || [],
      assignments: assignments || [],
      assessments: assessments || [],
      announcements: announcements || [],
      students: (enrolls || []).map((e) => e.profiles).filter(Boolean),
    })
  } catch (err) {
    console.error('faculty course detail error:', err)
    return res.status(500).json({ error: 'Failed to load course details' })
  }
})

// 4. POST /api/faculty/courses/:courseId/assignments
const createAssignmentSchema = z.object({
  title: z.string().min(3),
  instructions: z.string().optional(),
  maxMarks: z.number().int().positive().default(100),
  dueAt: z.string().datetime().or(z.string().min(10)),
  attachmentPath: z.string().optional(),
})

facultyRouter.post('/courses/:courseId/assignments', validateBody(createAssignmentSchema), async (req, res) => {
  try {
    const facultyId = req.user.id
    const { courseId } = req.params
    const { title, instructions, maxMarks, dueAt, attachmentPath } = req.body

    const isOwner = await checkFacultyCourseOwnership(facultyId, courseId)
    if (!isOwner) {
      return res.status(403).json({ error: 'Forbidden: You do not teach this course' })
    }

    const { data: created, error } = await supabaseAdmin
      .from('assignments')
      .insert({
        course_id: courseId,
        title,
        instructions,
        max_marks: maxMarks,
        due_at: new Date(dueAt).toISOString(),
        published_at: new Date().toISOString(),
        attachment_path: attachmentPath || null,
        created_by: facultyId,
      })
      .select()
      .single()

    if (error) throw error
    return res.status(201).json({ message: 'Assignment created successfully', assignment: created })
  } catch (err) {
    console.error('create assignment error:', err)
    return res.status(500).json({ error: 'Failed to create assignment' })
  }
})

// 5. POST /api/faculty/courses/:courseId/assessments
const createAssessmentSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  durationMinutes: z.number().int().positive().default(30),
  dueAt: z.string().datetime().or(z.string().min(10)),
  publishedAt: z.string().datetime().or(z.string().min(10)).optional(),
  resultsPublishedAt: z.string().datetime().or(z.string().min(10)).optional(),
  questions: z.array(
    z.object({
      topicId: z.string().uuid(),
      prompt: z.string().min(3),
      options: z.array(z.string()).min(2),
      marks: z.number().int().positive().default(1),
      correctAnswer: z.string().min(1),
      explanation: z.string().optional(),
    }),
  ).min(1, 'At least 1 question is required'),
})

facultyRouter.post('/courses/:courseId/assessments', validateBody(createAssessmentSchema), async (req, res) => {
  try {
    const facultyId = req.user.id
    const { courseId } = req.params
    const { title, description, durationMinutes, dueAt, publishedAt, resultsPublishedAt, questions } = req.body

    const isOwner = await checkFacultyCourseOwnership(facultyId, courseId)
    if (!isOwner) {
      return res.status(403).json({ error: 'Forbidden: You do not teach this course' })
    }

    // 1. Insert assessment
    const { data: assessment, error: asstErr } = await supabaseAdmin
      .from('assessments')
      .insert({
        course_id: courseId,
        title,
        description,
        duration_minutes: durationMinutes,
        due_at: new Date(dueAt).toISOString(),
        published_at: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
        results_published_at: resultsPublishedAt ? new Date(resultsPublishedAt).toISOString() : null,
        created_by: facultyId,
      })
      .select()
      .single()

    if (asstErr) throw asstErr

    // 2. Insert questions
    const questionRows = questions.map((q, idx) => ({
      assessment_id: assessment.id,
      topic_id: q.topicId,
      prompt: q.prompt,
      options: q.options,
      marks: q.marks,
      order_index: idx + 1,
    }))

    const { data: insertedQuestions, error: qErr } = await supabaseAdmin
      .from('questions')
      .insert(questionRows)
      .select()

    if (qErr) throw qErr

    // 3. Insert answer keys
    const answerKeyRows = (insertedQuestions || []).map((iq, idx) => ({
      question_id: iq.id,
      correct_answer: questions[idx].correctAnswer,
      explanation: questions[idx].explanation || null,
    }))

    const { error: keyErr } = await supabaseAdmin.from('answer_keys').insert(answerKeyRows)
    if (keyErr) throw keyErr

    return res.status(201).json({
      message: 'Assessment created successfully with answer keys',
      assessment,
      questionCount: insertedQuestions?.length || 0,
    })
  } catch (err) {
    console.error('create assessment error:', err)
    return res.status(500).json({ error: 'Failed to create assessment' })
  }
})

// 6. POST /api/faculty/courses/:courseId/resources
const createResourceSchema = z.object({
  topicId: z.string().uuid(),
  title: z.string().min(3),
  type: z.enum(['notes', 'slides', 'video', 'practice', 'link']).default('notes'),
  url: z.string().optional(),
  storagePath: z.string().optional(),
})

facultyRouter.post('/courses/:courseId/resources', validateBody(createResourceSchema), async (req, res) => {
  try {
    const facultyId = req.user.id
    const { courseId } = req.params
    const { topicId, title, type, url, storagePath } = req.body

    const isOwner = await checkFacultyCourseOwnership(facultyId, courseId)
    if (!isOwner) {
      return res.status(403).json({ error: 'Forbidden: You do not teach this course' })
    }

    const { data: created, error } = await supabaseAdmin
      .from('resources')
      .insert({
        course_id: courseId,
        topic_id: topicId,
        title,
        type,
        url: url || null,
        storage_path: storagePath || null,
        uploaded_by: facultyId,
      })
      .select()
      .single()

    if (error) throw error
    return res.status(201).json({ message: 'Resource uploaded successfully', resource: created })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create resource' })
  }
})

// 7. POST /api/faculty/courses/:courseId/announcements
const createAnnouncementSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(3),
})

facultyRouter.post('/courses/:courseId/announcements', validateBody(createAnnouncementSchema), async (req, res) => {
  try {
    const facultyId = req.user.id
    const { courseId } = req.params
    const { title, body } = req.body

    const isOwner = await checkFacultyCourseOwnership(facultyId, courseId)
    if (!isOwner) {
      return res.status(403).json({ error: 'Forbidden: You do not teach this course' })
    }

    const { data: created, error } = await supabaseAdmin
      .from('announcements')
      .insert({
        course_id: courseId,
        author_id: facultyId,
        title,
        body,
      })
      .select()
      .single()

    if (error) throw error
    return res.status(201).json({ message: 'Announcement created successfully', announcement: created })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to post announcement' })
  }
})

// 8. GET /api/faculty/assignments/:assignmentId/submissions
facultyRouter.get('/assignments/:assignmentId/submissions', async (req, res) => {
  try {
    const facultyId = req.user.id
    const { assignmentId } = req.params

    const { data: assignment, error: asgErr } = await supabaseAdmin
      .from('assignments')
      .select('*, courses!assignments_course_id_fkey(faculty_id)')
      .eq('id', assignmentId)
      .single()

    if (asgErr || !assignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }

    if (assignment.courses?.faculty_id !== facultyId) {
      return res.status(403).json({ error: 'Forbidden: You do not teach the course for this assignment' })
    }

    const { data: submissions, error: subErr } = await supabaseAdmin
      .from('submissions')
      .select('*, profiles!submissions_student_id_fkey(id, full_name, email, roll_no)')
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false })

    if (subErr) throw subErr
    return res.json({ assignment, submissions: submissions || [] })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load assignment submissions' })
  }
})

// 9. POST /api/faculty/submissions/:submissionId/evaluate
const evaluateSubmissionSchema = z.object({
  marks: z.number().int().min(0),
  feedback: z.string().optional(),
})

facultyRouter.post('/submissions/:submissionId/evaluate', validateBody(evaluateSubmissionSchema), async (req, res) => {
  try {
    const facultyId = req.user.id
    const { submissionId } = req.params
    const { marks, feedback } = req.body

    const { data: submission, error: subErr } = await supabaseAdmin
      .from('submissions')
      .select('*, assignments!submissions_assignment_id_fkey(course_id, courses!assignments_course_id_fkey(faculty_id))')
      .eq('id', submissionId)
      .single()

    if (subErr || !submission) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    if (submission.assignments?.courses?.faculty_id !== facultyId) {
      return res.status(403).json({ error: 'Forbidden: You do not teach the course for this submission' })
    }

    const { data: updated, error: upErr } = await supabaseAdmin
      .from('submissions')
      .update({
        marks,
        feedback: feedback || null,
        status: 'evaluated',
        evaluated_by: facultyId,
        evaluated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
      .select('*, profiles!submissions_student_id_fkey(full_name, email, roll_no)')
      .single()

    if (upErr) throw upErr
    return res.json({ message: 'Submission evaluated successfully', submission: updated })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to evaluate submission' })
  }
})

// 10. GET /api/faculty/heatmap/:courseId
facultyRouter.get('/heatmap/:courseId', async (req, res) => {
  try {
    const facultyId = req.user.id
    const { courseId } = req.params

    const isOwner = await checkFacultyCourseOwnership(facultyId, courseId)
    if (!isOwner) {
      return res.status(403).json({ error: 'Forbidden: You do not teach this course' })
    }

    // Try view v_confusion_heatmap first
    const { data: viewData, error: vErr } = await supabaseAdmin
      .from('v_confusion_heatmap')
      .select('*')
      .eq('course_id', courseId)

    if (!vErr && viewData && viewData.length > 0) {
      return res.json({ heatmap: viewData })
    }

    // Compute dynamically from topics, assessments, questions, attempts, responses
    const [
      { data: topics },
      { data: assessments },
      { data: questions },
      { data: responses },
    ] = await Promise.all([
      supabaseAdmin.from('topics').select('*').eq('course_id', courseId).order('order_index', { ascending: true }),
      supabaseAdmin.from('assessments').select('*').eq('course_id', courseId),
      supabaseAdmin.from('questions').select('id, assessment_id, topic_id'),
      supabaseAdmin.from('responses').select('question_id, is_correct'),
    ])

    const asstIds = (assessments || []).map((a) => a.id)
    const courseQuestions = (questions || []).filter((q) => asstIds.includes(q.assessment_id))
    const respMap = {}
    ;(responses || []).forEach((r) => {
      respMap[r.question_id] = respMap[r.question_id] || { correct: 0, total: 0 }
      respMap[r.question_id].total += 1
      if (r.is_correct) respMap[r.question_id].correct += 1
    })

    const rows = (topics || []).map((t) => {
      const cells = (assessments || []).map((a) => {
        const qList = courseQuestions.filter((q) => q.assessment_id === a.id && q.topic_id === t.id)
        let total = 0
        let wrong = 0
        for (const q of qList) {
          const stats = respMap[q.id]
          if (stats) {
            total += stats.total
            wrong += stats.total - stats.correct
          }
        }
        const incorrectPct = total > 0 ? Math.round((wrong / total) * 100) : null
        return {
          assessmentTitle: a.title,
          count: total,
          incorrectPct,
          enoughResponses: total >= 3,
        }
      })
      const valid = cells.filter((c) => c.incorrectPct != null)
      const avgIncorrect = valid.length ? Math.round(valid.reduce((s, c) => s + c.incorrectPct * c.count, 0) / valid.reduce((s, c) => s + c.count, 0)) : null
      return {
        topic: t,
        cells,
        avgIncorrectPct: avgIncorrect,
        totalResponses: valid.reduce((s, c) => s + c.count, 0),
      }
    })

    return res.json({
      assessments: (assessments || []).map((a) => a.title),
      rows,
    })
  } catch (err) {
    console.error('heatmap error:', err)
    return res.status(500).json({ error: 'Failed to generate confusion heatmap' })
  }
})

// 11. GET /api/faculty/risk/:courseId
facultyRouter.get('/risk/:courseId', async (req, res) => {
  try {
    const facultyId = req.user.id
    const { courseId } = req.params

    const isOwner = await checkFacultyCourseOwnership(facultyId, courseId)
    if (!isOwner) {
      return res.status(403).json({ error: 'Forbidden: You do not teach this course' })
    }

    const { data: riskRows, error } = await supabaseAdmin
      .from('v_student_risk')
      .select('*')
      .eq('course_id', courseId)
      .order('risk_score', { ascending: false })

    if (error) throw error
    return res.json({ students: riskRows || [] })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load student risk data' })
  }
})

// 12. GET /api/faculty/students/:studentId
facultyRouter.get('/students/:studentId', async (req, res) => {
  try {
    const facultyId = req.user.id
    const { studentId } = req.params

    const { data: myCourses } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('faculty_id', facultyId)

    const myCourseIds = (myCourses || []).map((c) => c.id)

    // Verify student is enrolled in at least one course taught by this faculty
    const { data: enroll } = await supabaseAdmin
      .from('enrollments')
      .select('course_id')
      .eq('student_id', studentId)
      .in('course_id', myCourseIds)
      .eq('status', 'active')
      .maybeSingle()

    if (!enroll) {
      return res.status(403).json({ error: 'Forbidden: Student is not enrolled in any of your courses' })
    }

    const [
      { data: profile },
      { data: riskRows },
      { data: masteryRows },
      { data: submissions },
      { data: attempts },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*, departments(code, name)').eq('id', studentId).single(),
      supabaseAdmin.from('v_student_risk').select('*').eq('student_id', studentId).in('course_id', myCourseIds),
      supabaseAdmin.from('topic_mastery').select('*, topics(title, course_id)').eq('student_id', studentId),
      supabaseAdmin.from('submissions').select('*, assignments!inner(title, max_marks, course_id)').eq('student_id', studentId).in('assignments.course_id', myCourseIds),
      supabaseAdmin.from('attempts').select('*, assessments!inner(title, course_id)').eq('student_id', studentId).in('assessments.course_id', myCourseIds),
    ])

    return res.json({
      student: profile,
      riskProfiles: riskRows || [],
      mastery: masteryRows || [],
      submissions: submissions || [],
      attempts: attempts || [],
    })
  } catch (err) {
    console.error('faculty student view error:', err)
    return res.status(500).json({ error: 'Failed to load student details' })
  }
})
