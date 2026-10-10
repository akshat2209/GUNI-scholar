import { Router } from 'express'
import { z } from 'zod'
import { supabaseAdmin } from '../config/supabase.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'

export const studentRouter = Router()

// Apply authentication and student role check to all student routes
studentRouter.use(requireAuth, requireRole('student'))

// Helper: check student enrollment in a course
async function checkStudentEnrollment(studentId, courseId) {
  const { data } = await supabaseAdmin
    .from('enrollments')
    .select('id')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .eq('status', 'active')
    .maybeSingle()
  return !!data
}

// 1. GET /api/student/dashboard
studentRouter.get('/dashboard', async (req, res) => {
  try {
    const studentId = req.user.id

    // Enrolled courses
    const { data: enrolls } = await supabaseAdmin
      .from('enrollments')
      .select('course_id, courses(*, profiles!courses_faculty_id_fkey(full_name, email), departments(code, name))')
      .eq('student_id', studentId)
      .eq('status', 'active')

    const courses = (enrolls || []).map((e) => e.courses).filter(Boolean)
    const courseIds = courses.map((c) => c.id)

    // Upcoming assignments (not yet submitted or due soon)
    const { data: assignments } = await supabaseAdmin
      .from('assignments')
      .select('*, courses(code, title)')
      .in('course_id', courseIds.length ? courseIds : ['00000000-0000-0000-0000-000000000000'])
      .order('due_at', { ascending: true })

    const { data: submissions } = await supabaseAdmin
      .from('submissions')
      .select('assignment_id, status, marks, submitted_at')
      .eq('student_id', studentId)

    const subMap = Object.fromEntries((submissions || []).map((s) => [s.assignment_id, s]))

    const upcomingAssignments = (assignments || []).map((a) => ({
      ...a,
      submission: subMap[a.id] || null,
    }))

    // Recent attempts
    const { data: attempts } = await supabaseAdmin
      .from('attempts')
      .select('*, assessments(id, title, course_id, courses(code, title))')
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false })
      .limit(5)

    // Risk profile from view v_student_risk
    const { data: riskRows } = await supabaseAdmin
      .from('v_student_risk')
      .select('*')
      .eq('student_id', studentId)

    return res.json({
      student: req.user,
      courses,
      upcomingAssignments,
      recentAttempts: attempts || [],
      riskProfiles: riskRows || [],
    })
  } catch (err) {
    console.error('student dashboard error:', err)
    return res.status(500).json({ error: 'Failed to load student dashboard' })
  }
})

// 2. GET /api/student/courses
studentRouter.get('/courses', async (req, res) => {
  try {
    const studentId = req.user.id
    const { data: enrolls, error } = await supabaseAdmin
      .from('enrollments')
      .select('course_id, courses(*, profiles!courses_faculty_id_fkey(full_name, email), departments(code, name))')
      .eq('student_id', studentId)
      .eq('status', 'active')

    if (error) throw error
    const courses = (enrolls || []).map((e) => e.courses).filter(Boolean)
    return res.json({ courses })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load enrolled courses' })
  }
})

// 3. GET /api/student/courses/:courseId
studentRouter.get('/courses/:courseId', async (req, res) => {
  try {
    const studentId = req.user.id
    const { courseId } = req.params

    const isEnrolled = await checkStudentEnrollment(studentId, courseId)
    if (!isEnrolled) {
      return res.status(403).json({ error: 'Forbidden: You are not enrolled in this course' })
    }

    const [
      { data: course },
      { data: topics },
      { data: topicPrereqs },
      { data: resources },
      { data: assignments },
      { data: announcements },
    ] = await Promise.all([
      supabaseAdmin.from('courses').select('*, profiles!courses_faculty_id_fkey(full_name, email), departments(code, name)').eq('id', courseId).single(),
      supabaseAdmin.from('topics').select('*').eq('course_id', courseId).order('order_index', { ascending: true }),
      supabaseAdmin.from('topic_prerequisites').select('*'),
      supabaseAdmin.from('resources').select('*').eq('course_id', courseId),
      supabaseAdmin.from('assignments').select('*').eq('course_id', courseId).order('due_at', { ascending: true }),
      supabaseAdmin.from('announcements').select('*').eq('course_id', courseId).order('created_at', { ascending: false }),
    ])

    const prereqMap = {}
    ;(topicPrereqs || []).forEach((p) => {
      prereqMap[p.topic_id] = prereqMap[p.topic_id] || []
      prereqMap[p.topic_id].push(p.prerequisite_topic_id)
    })

    const topicsWithPrereqs = (topics || []).map((t) => ({
      ...t,
      prerequisites: prereqMap[t.id] || [],
    }))

    return res.json({
      course,
      topics: topicsWithPrereqs,
      resources: resources || [],
      assignments: assignments || [],
      announcements: announcements || [],
    })
  } catch (err) {
    console.error('course detail error:', err)
    return res.status(500).json({ error: 'Failed to load course details' })
  }
})

// 4. GET /api/student/assignments
studentRouter.get('/assignments', async (req, res) => {
  try {
    const studentId = req.user.id

    const { data: enrolls } = await supabaseAdmin
      .from('enrollments')
      .select('course_id')
      .eq('student_id', studentId)
      .eq('status', 'active')

    const courseIds = (enrolls || []).map((e) => e.course_id)
    if (!courseIds.length) return res.json({ assignments: [] })

    const { data: assignments, error: asgErr } = await supabaseAdmin
      .from('assignments')
      .select('*, courses(code, title)')
      .in('course_id', courseIds)
      .order('due_at', { ascending: true })

    if (asgErr) throw asgErr

    const { data: submissions } = await supabaseAdmin
      .from('submissions')
      .select('*')
      .eq('student_id', studentId)

    const subMap = Object.fromEntries((submissions || []).map((s) => [s.assignment_id, s]))

    const result = (assignments || []).map((a) => ({
      ...a,
      submission: subMap[a.id] || null,
    }))

    return res.json({ assignments: result })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load assignments' })
  }
})

// 5. POST /api/student/assignments/:assignmentId/submit
const submitAssignmentSchema = z.object({
  filePath: z.string().min(1, 'File path is required'),
  notes: z.string().optional(),
})

studentRouter.post('/assignments/:assignmentId/submit', validateBody(submitAssignmentSchema), async (req, res) => {
  try {
    const studentId = req.user.id
    const { assignmentId } = req.params
    const { filePath, notes } = req.body

    const { data: assignment, error: asgErr } = await supabaseAdmin
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .single()

    if (asgErr || !assignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }

    const isEnrolled = await checkStudentEnrollment(studentId, assignment.course_id)
    if (!isEnrolled) {
      return res.status(403).json({ error: 'Forbidden: You are not enrolled in this assignment course' })
    }

    // Determine on-time or late status
    const now = new Date()
    const dueDate = new Date(assignment.due_at)
    const status = now > dueDate ? 'late' : 'submitted'

    // Check if previous submission exists
    const { data: existing } = await supabaseAdmin
      .from('submissions')
      .select('id')
      .eq('assignment_id', assignmentId)
      .eq('student_id', studentId)
      .maybeSingle()

    let submissionRecord
    if (existing) {
      const { data: updated, error } = await supabaseAdmin
        .from('submissions')
        .update({
          file_path: filePath,
          notes: notes || null,
          submitted_at: now.toISOString(),
          status,
          updated_at: now.toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      submissionRecord = updated
    } else {
      const { data: created, error } = await supabaseAdmin
        .from('submissions')
        .insert({
          assignment_id: assignmentId,
          student_id: studentId,
          file_path: filePath,
          notes: notes || null,
          submitted_at: now.toISOString(),
          status,
        })
        .select()
        .single()
      if (error) throw error
      submissionRecord = created
    }

    return res.json({
      message: status === 'late' ? 'Assignment submitted (marked late)' : 'Assignment submitted successfully',
      submission: submissionRecord,
    })
  } catch (err) {
    console.error('submit assignment error:', err)
    return res.status(500).json({ error: 'Failed to submit assignment' })
  }
})

// 6. GET /api/student/assessments
studentRouter.get('/assessments', async (req, res) => {
  try {
    const studentId = req.user.id

    const { data: enrolls } = await supabaseAdmin
      .from('enrollments')
      .select('course_id')
      .eq('student_id', studentId)
      .eq('status', 'active')

    const courseIds = (enrolls || []).map((e) => e.course_id)
    if (!courseIds.length) return res.json({ assessments: [] })

    const { data: assessments, error: asstErr } = await supabaseAdmin
      .from('assessments')
      .select('*, courses(code, title)')
      .in('course_id', courseIds)
      .order('due_at', { ascending: true })

    if (asstErr) throw asstErr

    const { data: attempts } = await supabaseAdmin
      .from('attempts')
      .select('*')
      .eq('student_id', studentId)

    const attemptMap = {}
    ;(attempts || []).forEach((att) => {
      attemptMap[att.assessment_id] = attemptMap[att.assessment_id] || []
      attemptMap[att.assessment_id].push(att)
    })

    const result = (assessments || []).map((a) => ({
      ...a,
      attempts: attemptMap[a.id] || [],
    }))

    return res.json({ assessments: result })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load assessments' })
  }
})

// 7. GET /api/student/assessments/:assessmentId
studentRouter.get('/assessments/:assessmentId', async (req, res) => {
  try {
    const studentId = req.user.id
    const { assessmentId } = req.params

    const { data: assessment, error: asstErr } = await supabaseAdmin
      .from('assessments')
      .select('*, courses(code, title)')
      .eq('id', assessmentId)
      .single()

    if (asstErr || !assessment) {
      return res.status(404).json({ error: 'Assessment not found' })
    }

    const isEnrolled = await checkStudentEnrollment(studentId, assessment.course_id)
    if (!isEnrolled) {
      return res.status(403).json({ error: 'Forbidden: You are not enrolled in this course' })
    }

    const { data: questions, error: qErr } = await supabaseAdmin
      .from('questions')
      .select('id, assessment_id, topic_id, prompt, options, marks, order_index')
      .eq('assessment_id', assessmentId)
      .order('order_index', { ascending: true })

    if (qErr) throw qErr

    // CRITICAL SECURITY RULE:
    // "Never return correct_answer or explanation from answer_keys to a student before the assessment's results_published_at is set."
    const now = new Date()
    const isResultsPublished = assessment.results_published_at && new Date(assessment.results_published_at) <= now

    let answerKeys = []
    if (isResultsPublished) {
      const qIds = (questions || []).map((q) => q.id)
      const { data: keys } = await supabaseAdmin
        .from('answer_keys')
        .select('*')
        .in('question_id', qIds)
      answerKeys = keys || []
    }

    const keyMap = Object.fromEntries(answerKeys.map((k) => [k.question_id, k]))

    const sanitizedQuestions = (questions || []).map((q) => {
      if (isResultsPublished && keyMap[q.id]) {
        return {
          ...q,
          correctAnswer: keyMap[q.id].correct_answer,
          explanation: keyMap[q.id].explanation,
        }
      }
      return q
    })

    // Existing attempts
    const { data: attempts } = await supabaseAdmin
      .from('attempts')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('student_id', studentId)

    return res.json({
      assessment,
      questions: sanitizedQuestions,
      isResultsPublished,
      attempts: attempts || [],
    })
  } catch (err) {
    console.error('get assessment error:', err)
    return res.status(500).json({ error: 'Failed to load assessment questions' })
  }
})

// 8. POST /api/student/assessments/:assessmentId/start
studentRouter.post('/assessments/:assessmentId/start', async (req, res) => {
  try {
    const studentId = req.user.id
    const { assessmentId } = req.params

    const { data: assessment, error: asstErr } = await supabaseAdmin
      .from('assessments')
      .select('course_id')
      .eq('id', assessmentId)
      .single()

    if (asstErr || !assessment) {
      return res.status(404).json({ error: 'Assessment not found' })
    }

    const isEnrolled = await checkStudentEnrollment(studentId, assessment.course_id)
    if (!isEnrolled) {
      return res.status(403).json({ error: 'Forbidden: You are not enrolled in this course' })
    }

    const { data: attempt, error } = await supabaseAdmin
      .from('attempts')
      .insert({
        assessment_id: assessmentId,
        student_id: studentId,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return res.status(201).json({
      message: 'Assessment attempt started',
      attemptId: attempt.id,
      startedAt: attempt.started_at,
    })
  } catch (err) {
    console.error('start assessment error:', err)
    return res.status(500).json({ error: 'Failed to start assessment' })
  }
})

// 9. POST /api/student/assessments/:assessmentId/submit
const submitQuizSchema = z.object({
  attemptId: z.string().uuid(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      selectedAnswer: z.string(),
    }),
  ),
})

studentRouter.post('/assessments/:assessmentId/submit', validateBody(submitQuizSchema), async (req, res) => {
  try {
    const studentId = req.user.id
    const { assessmentId } = req.params
    const { attemptId, answers } = req.body

    // 1. Verify attempt ownership
    const { data: attempt, error: attErr } = await supabaseAdmin
      .from('attempts')
      .select('*')
      .eq('id', attemptId)
      .eq('student_id', studentId)
      .eq('assessment_id', assessmentId)
      .single()

    if (attErr || !attempt) {
      return res.status(404).json({ error: 'Active assessment attempt not found' })
    }

    // 2. Fetch all questions and answer keys
    const { data: questions } = await supabaseAdmin
      .from('questions')
      .select('id, topic_id, marks')
      .eq('assessment_id', assessmentId)

    const qIds = (questions || []).map((q) => q.id)
    const { data: answerKeys } = await supabaseAdmin
      .from('answer_keys')
      .select('question_id, correct_answer')
      .in('question_id', qIds)

    const keyMap = Object.fromEntries((answerKeys || []).map((k) => [k.question_id, k.correct_answer]))
    const qTopicMap = Object.fromEntries((questions || []).map((q) => [q.id, q.topic_id]))

    // 3. Grade each answer server-side
    let totalMarks = 0
    let earnedMarks = 0
    const responseRows = []
    const topicStats = {} // topic_id -> { correct: 0, total: 0 }

    for (const q of questions || []) {
      totalMarks += q.marks || 1
      const studentAns = answers.find((a) => a.questionId === q.id)
      const selected = studentAns?.selectedAnswer || ''
      const correct = keyMap[q.id]
      const isCorrect = correct != null && selected.trim().toLowerCase() === correct.trim().toLowerCase()

      if (isCorrect) {
        earnedMarks += q.marks || 1
      }

      responseRows.push({
        attempt_id: attemptId,
        question_id: q.id,
        selected_answer: selected,
        is_correct: isCorrect,
        answered_at: new Date().toISOString(),
      })

      if (q.topic_id) {
        topicStats[q.topic_id] = topicStats[q.topic_id] || { correct: 0, total: 0 }
        topicStats[q.topic_id].total += 1
        if (isCorrect) topicStats[q.topic_id].correct += 1
      }
    }

    const scorePct = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100 * 100) / 100 : 0

    // 4. Save responses in table
    if (responseRows.length) {
      await supabaseAdmin.from('responses').insert(responseRows)
    }

    // 5. Update attempt with score and submitted_at
    const { data: updatedAttempt, error: upErr } = await supabaseAdmin
      .from('attempts')
      .update({
        submitted_at: new Date().toISOString(),
        score: scorePct,
      })
      .eq('id', attemptId)
      .select()
      .single()

    if (upErr) throw upErr

    // 6. Recompute topic_mastery in Supabase for all affected topics
    for (const topicId of Object.keys(topicStats)) {
      // Find all responses by this student for this topic
      const { data: topicQuestions } = await supabaseAdmin
        .from('questions')
        .select('id')
        .eq('topic_id', topicId)

      const topicQIds = (topicQuestions || []).map((q) => q.id)
      if (topicQIds.length) {
        const { data: studentResponses } = await supabaseAdmin
          .from('responses')
          .select('is_correct, attempts!inner(student_id)')
          .in('question_id', topicQIds)
          .eq('attempts.student_id', studentId)

        const totalResp = studentResponses?.length || topicStats[topicId].total
        const correctResp = studentResponses?.filter((r) => r.is_correct).length || topicStats[topicId].correct
        const masteryScore = totalResp > 0 ? Math.round((correctResp / totalResp) * 100) : 0

        // Upsert to topic_mastery
        const { data: existingMastery } = await supabaseAdmin
          .from('topic_mastery')
          .select('id')
          .eq('student_id', studentId)
          .eq('topic_id', topicId)
          .maybeSingle()

        if (existingMastery) {
          await supabaseAdmin
            .from('topic_mastery')
            .update({
              mastery_score: masteryScore,
              correct_count: correctResp,
              total_count: totalResp,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingMastery.id)
        } else {
          await supabaseAdmin.from('topic_mastery').insert({
            student_id: studentId,
            topic_id: topicId,
            mastery_score: masteryScore,
            correct_count: correctResp,
            total_count: totalResp,
          })
        }
      }
    }

    return res.json({
      message: 'Assessment submitted and graded successfully',
      attempt: updatedAttempt,
      score: scorePct,
      earnedMarks,
      totalMarks,
    })
  } catch (err) {
    console.error('submit quiz error:', err)
    return res.status(500).json({ error: 'Failed to grade and submit assessment' })
  }
})

// 10. GET /api/student/analytics/:courseId
studentRouter.get('/analytics/:courseId', async (req, res) => {
  try {
    const studentId = req.user.id
    const { courseId } = req.params

    const isEnrolled = await checkStudentEnrollment(studentId, courseId)
    if (!isEnrolled) {
      return res.status(403).json({ error: 'Forbidden: You are not enrolled in this course' })
    }

    const [
      { data: topics },
      { data: masteryRows },
      { data: assessments },
      { data: attempts },
      { data: riskRow },
      { data: resources },
    ] = await Promise.all([
      supabaseAdmin.from('topics').select('*').eq('course_id', courseId).order('order_index', { ascending: true }),
      supabaseAdmin.from('topic_mastery').select('*').eq('student_id', studentId),
      supabaseAdmin.from('assessments').select('id, title, due_at').eq('course_id', courseId),
      supabaseAdmin.from('attempts').select('*, assessments(id, title)').eq('student_id', studentId).order('submitted_at', { ascending: true }),
      supabaseAdmin.from('v_student_risk').select('*').eq('student_id', studentId).eq('course_id', courseId).maybeSingle(),
      supabaseAdmin.from('resources').select('*').eq('course_id', courseId),
    ])

    const masteryMap = Object.fromEntries((masteryRows || []).map((m) => [m.topic_id, m]))

    const topicMasteryList = (topics || []).map((t) => {
      const rec = masteryMap[t.id]
      return {
        ...t,
        mastery: rec ? rec.mastery_score : null,
        correctCount: rec ? rec.correct_count : 0,
        totalCount: rec ? rec.total_count : 0,
      }
    })

    // Recommendations for topics below 55%
    const weakTopics = topicMasteryList.filter((t) => t.mastery != null && t.mastery < 55)
    const recommendations = weakTopics.map((wt) => {
      const topicResources = (resources || []).filter((r) => r.topic_id === wt.id)
      return {
        topic: wt,
        mastery: wt.mastery,
        resources: topicResources,
        reason: `Mastery is ${wt.mastery}%, below the recommended 55% threshold.`,
      }
    })

    return res.json({
      courseId,
      topics: topicMasteryList,
      attempts: attempts || [],
      risk: riskRow || null,
      recommendations,
    })
  } catch (err) {
    console.error('analytics error:', err)
    return res.status(500).json({ error: 'Failed to load course analytics' })
  }
})

// 11. GET /api/student/study-plan/:courseId
studentRouter.get('/study-plan/:courseId', async (req, res) => {
  try {
    const studentId = req.user.id
    const { courseId } = req.params

    const isEnrolled = await checkStudentEnrollment(studentId, courseId)
    if (!isEnrolled) {
      return res.status(403).json({ error: 'Forbidden: You are not enrolled in this course' })
    }

    // Find existing study plan
    let { data: plan } = await supabaseAdmin
      .from('study_plans')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .maybeSingle()

    if (!plan) {
      // Create new study plan
      const { data: newPlan, error } = await supabaseAdmin
        .from('study_plans')
        .insert({
          student_id: studentId,
          course_id: courseId,
          title: `Smart Study Plan — ${courseId}`,
        })
        .select()
        .single()

      if (error) throw error
      plan = newPlan

      // Generate initial tasks based on weak topics and resources
      const { data: topics } = await supabaseAdmin.from('topics').select('*').eq('course_id', courseId).limit(3)
      const { data: resources } = await supabaseAdmin.from('resources').select('*').eq('course_id', courseId).limit(3)

      const taskInserts = (topics || []).map((t, idx) => ({
        plan_id: plan.id,
        topic_id: t.id,
        resource_id: resources?.[idx]?.id || null,
        title: `Review ${t.title} lecture material & practice problems`,
        task_type: idx === 0 ? 'lesson' : idx === 1 ? 'practice' : 'review',
        scheduled_for: new Date(Date.now() + (idx + 1) * 86400000).toISOString(),
        status: 'pending',
      }))

      if (taskInserts.length) {
        await supabaseAdmin.from('study_plan_tasks').insert(taskInserts)
      }
    }

    const { data: tasks } = await supabaseAdmin
      .from('study_plan_tasks')
      .select('*, topics(title), resources(title, url, type)')
      .eq('plan_id', plan.id)
      .order('created_at', { ascending: true })

    return res.json({
      plan,
      tasks: tasks || [],
    })
  } catch (err) {
    console.error('study plan error:', err)
    return res.status(500).json({ error: 'Failed to load study plan' })
  }
})

// 12. PATCH /api/student/study-plan/tasks/:taskId
const updateTaskSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed']),
})

studentRouter.patch('/study-plan/tasks/:taskId', validateBody(updateTaskSchema), async (req, res) => {
  try {
    const { taskId } = req.params
    const { status } = req.body

    const { data: task, error } = await supabaseAdmin
      .from('study_plan_tasks')
      .update({
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error
    return res.json({ message: 'Task updated', task })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update study plan task' })
  }
})
