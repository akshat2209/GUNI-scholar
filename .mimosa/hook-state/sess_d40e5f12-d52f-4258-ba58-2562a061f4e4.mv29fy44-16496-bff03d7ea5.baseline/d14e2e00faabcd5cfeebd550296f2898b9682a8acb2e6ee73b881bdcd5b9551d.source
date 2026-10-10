import { Router } from 'express'
import { z } from 'zod'
import { supabaseAdmin } from '../config/supabase.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'

export const adminRouter = Router()

adminRouter.use(requireAuth, requireRole('admin'))

// 1. GET /api/admin/overview
adminRouter.get('/overview', async (req, res) => {
  try {
    const [
      { data: profiles },
      { data: courses },
      { data: enrollments },
      { data: submissions },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, role'),
      supabaseAdmin.from('courses').select('id'),
      supabaseAdmin.from('enrollments').select('id').eq('status', 'active'),
      supabaseAdmin.from('submissions').select('id, status'),
    ])

    const roleCounts = { student: 0, faculty: 0, dean: 0, admin: 0 }
    ;(profiles || []).forEach((p) => {
      if (roleCounts[p.role] !== undefined) roleCounts[p.role]++
    })

    const pendingEvaluations = (submissions || []).filter((s) => s.status !== 'evaluated').length

    return res.json({
      totalUsers: profiles?.length || 0,
      roleCounts,
      totalCourses: courses?.length || 0,
      totalEnrollments: enrollments?.length || 0,
      pendingEvaluations,
    })
  } catch (err) {
    console.error('admin overview error:', err)
    return res.status(500).json({ error: 'Failed to load platform admin overview' })
  }
})

// 2. GET /api/admin/users
adminRouter.get('/users', async (req, res) => {
  try {
    const { role, query } = req.query
    let q = supabaseAdmin
      .from('profiles')
      .select('*, departments(code, name)')
      .order('created_at', { ascending: false })

    if (role && role !== 'all') {
      q = q.eq('role', role)
    }

    const { data: users, error } = await q
    if (error) throw error

    let filtered = users || []
    if (query) {
      const lower = query.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(lower) ||
          u.email?.toLowerCase().includes(lower) ||
          u.roll_no?.toLowerCase().includes(lower),
      )
    }

    return res.json({ users: filtered })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load users' })
  }
})

// 3. PATCH /api/admin/users/:userId/role
const updateRoleSchema = z.object({
  role: z.enum(['student', 'faculty', 'dean', 'admin']),
})

adminRouter.patch('/users/:userId/role', validateBody(updateRoleSchema), async (req, res) => {
  try {
    const { userId } = req.params
    const { role } = req.body

    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('*, departments(code, name)')
      .single()

    if (error) throw error
    return res.json({ message: 'User role updated successfully', user: updated })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update user role' })
  }
})

// 4. POST /api/admin/courses
const createCourseSchema = z.object({
  code: z.string().min(2),
  title: z.string().min(3),
  description: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  semester: z.number().int().min(1).max(8).default(1),
  academicYear: z.string().default('2025-26'),
  facultyId: z.string().uuid().optional(),
})

adminRouter.post('/courses', validateBody(createCourseSchema), async (req, res) => {
  try {
    const { code, title, description, departmentId, semester, academicYear, facultyId } = req.body

    const { data: created, error } = await supabaseAdmin
      .from('courses')
      .insert({
        code,
        title,
        description: description || null,
        department_id: departmentId || null,
        semester,
        academic_year: academicYear,
        faculty_id: facultyId || null,
      })
      .select('*, departments(code, name), profiles!courses_faculty_id_fkey(full_name, email)')
      .single()

    if (error) throw error
    return res.status(201).json({ message: 'Course created successfully', course: created })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create course' })
  }
})

// 5. PATCH /api/admin/courses/:courseId/faculty
const assignFacultySchema = z.object({
  facultyId: z.string().uuid(),
})

adminRouter.patch('/courses/:courseId/faculty', validateBody(assignFacultySchema), async (req, res) => {
  try {
    const { courseId } = req.params
    const { facultyId } = req.body

    const { data: updated, error } = await supabaseAdmin
      .from('courses')
      .update({
        faculty_id: facultyId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', courseId)
      .select('*, profiles!courses_faculty_id_fkey(full_name, email)')
      .single()

    if (error) throw error
    return res.json({ message: 'Faculty assigned successfully', course: updated })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to assign faculty to course' })
  }
})

// 6. POST /api/admin/courses/:courseId/enrollments
const manageEnrollmentSchema = z.object({
  studentId: z.string().uuid(),
  action: z.enum(['enroll', 'unenroll']),
})

adminRouter.post('/courses/:courseId/enrollments', validateBody(manageEnrollmentSchema), async (req, res) => {
  try {
    const { courseId } = req.params
    const { studentId, action } = req.body

    if (action === 'enroll') {
      const { data: existing } = await supabaseAdmin
        .from('enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('student_id', studentId)
        .maybeSingle()

      if (existing) {
        if (existing.status !== 'active') {
          await supabaseAdmin.from('enrollments').update({ status: 'active' }).eq('id', existing.id)
        }
      } else {
        await supabaseAdmin.from('enrollments').insert({
          course_id: courseId,
          student_id: studentId,
          status: 'active',
        })
      }
      return res.json({ message: 'Student enrolled successfully' })
    } else {
      await supabaseAdmin
        .from('enrollments')
        .delete()
        .eq('course_id', courseId)
        .eq('student_id', studentId)

      return res.json({ message: 'Student enrollment removed' })
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update enrollment' })
  }
})
