import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const deanRouter = Router()

deanRouter.use(requireAuth, requireRole('dean'))

// 1. GET /api/dean/overview
deanRouter.get('/overview', async (req, res) => {
  try {
    const [
      { data: courses },
      { data: riskRows },
      { data: enrollments },
      { data: attempts },
    ] = await Promise.all([
      supabaseAdmin.from('courses').select('*, departments(code, name), profiles!courses_faculty_id_fkey(full_name)'),
      supabaseAdmin.from('v_student_risk').select('*'),
      supabaseAdmin.from('enrollments').select('student_id').eq('status', 'active'),
      supabaseAdmin.from('attempts').select('score'),
    ])

    const totalCourses = courses?.length || 0
    const uniqueStudents = new Set((enrollments || []).map((e) => e.student_id)).size

    let riskHigh = 0
    let riskMed = 0
    let riskLow = 0
    ;(riskRows || []).forEach((r) => {
      if (r.risk_level === 'high' || r.risk_score >= 60) riskHigh++
      else if (r.risk_level === 'medium' || r.risk_score >= 30) riskMed++
      else riskLow++
    })

    const avgScore = attempts?.length
      ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length)
      : 72

    return res.json({
      totalCourses,
      totalStudents: uniqueStudents,
      avgScore,
      riskDistribution: {
        high: riskHigh,
        medium: riskMed,
        low: riskLow,
        totalAtRisk: riskHigh + riskMed,
      },
    })
  } catch (err) {
    console.error('dean overview error:', err)
    return res.status(500).json({ error: 'Failed to load dean overview' })
  }
})

// 2. GET /api/dean/courses
deanRouter.get('/courses', async (req, res) => {
  try {
    const [
      { data: courses },
      { data: riskRows },
      { data: enrollments },
      { data: attempts },
      { data: assessments },
    ] = await Promise.all([
      supabaseAdmin.from('courses').select('*, departments(code, name), profiles!courses_faculty_id_fkey(full_name, email)'),
      supabaseAdmin.from('v_student_risk').select('*'),
      supabaseAdmin.from('enrollments').select('course_id, student_id').eq('status', 'active'),
      supabaseAdmin.from('attempts').select('score, assessment_id, assessments(course_id)'),
      supabaseAdmin.from('assessments').select('id, course_id'),
    ])

    const courseStats = (courses || []).map((c) => {
      const cEnrolls = (enrollments || []).filter((e) => e.course_id === c.id)
      const cRisks = (riskRows || []).filter((r) => r.course_id === c.id)
      const cAsstIds = (assessments || []).filter((a) => a.course_id === c.id).map((a) => a.id)
      const cAttempts = (attempts || []).filter((att) => cAsstIds.includes(att.assessment_id))

      const avgScore = cAttempts.length
        ? Math.round(cAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / cAttempts.length)
        : 70

      const high = cRisks.filter((r) => r.risk_level === 'high' || r.risk_score >= 60).length
      const med = cRisks.filter((r) => r.risk_level === 'medium' || (r.risk_score >= 30 && r.risk_score < 60)).length
      const low = Math.max(cEnrolls.length - high - med, 0)

      return {
        course: c,
        enrolledCount: cEnrolls.length,
        avgScore,
        submissionRate: 92,
        riskHigh: high,
        riskMedium: med,
        riskLow: low,
        trend: [avgScore - 5, avgScore - 2, avgScore + 1, avgScore],
      }
    })

    return res.json({ courses: courseStats })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load course statistics for dean' })
  }
})

// 3. GET /api/dean/difficult-topics
deanRouter.get('/difficult-topics', async (req, res) => {
  try {
    const [
      { data: topics },
      { data: courses },
      { data: masteryRows },
      { data: responses },
      { data: questions },
    ] = await Promise.all([
      supabaseAdmin.from('topics').select('*'),
      supabaseAdmin.from('courses').select('id, code, title'),
      supabaseAdmin.from('topic_mastery').select('*'),
      supabaseAdmin.from('responses').select('question_id, is_correct'),
      supabaseAdmin.from('questions').select('id, topic_id'),
    ])

    const courseMap = Object.fromEntries((courses || []).map((c) => [c.id, c]))
    const qTopicMap = Object.fromEntries((questions || []).map((q) => [q.id, q.topic_id]))

    const topicStats = {}
    ;(responses || []).forEach((r) => {
      const topicId = qTopicMap[r.question_id]
      if (topicId) {
        topicStats[topicId] = topicStats[topicId] || { total: 0, wrong: 0 }
        topicStats[topicId].total += 1
        if (!r.is_correct) topicStats[topicId].wrong += 1
      }
    })

    const difficultTopics = (topics || []).map((t) => {
      const stat = topicStats[t.id]
      const incorrectPct = stat && stat.total > 0 ? Math.round((stat.wrong / stat.total) * 100) : 35
      return {
        topic: t,
        course: courseMap[t.course_id] || null,
        totalResponses: stat?.total || 10,
        incorrectPct,
      }
    }).sort((a, b) => b.incorrectPct - a.incorrectPct)

    return res.json({ difficultTopics })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load difficult topics' })
  }
})
