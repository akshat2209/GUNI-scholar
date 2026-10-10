import { Router } from 'express'
import { z } from 'zod'
import { supabaseAdmin } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { signJwt } from '../utils/jwt.js'

export const commonRouter = Router()

// POST /api/auth/login - Universal authentication against Supabase profiles
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

commonRouter.post('/auth/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body
    const cleanEmail = email.trim().toLowerCase()

    // 1. Fetch user profile from Supabase
    const { data: profile, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('*, departments(code, name, institute)')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (profErr || !profile) {
      return res.status(401).json({
        error: `Account with email ${cleanEmail} was not found in the university database.`,
      })
    }

    // 2. Format mapped user
    const safeUser = {
      id: profile.id,
      email: profile.email,
      name: profile.full_name,
      role: profile.role,
      rollNo: profile.roll_no,
      departmentId: profile.department_id,
      department: profile.departments,
      status: 'active',
    }

    // 3. Generate signed access token
    const token = signJwt({
      id: profile.id,
      sub: profile.id,
      email: profile.email,
      role: profile.role,
      name: profile.full_name,
    })

    return res.json({
      message: 'Authentication successful',
      token,
      user: safeUser,
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Internal server error during authentication' })
  }
})

// GET /api/me - Current user profile & associated courses
commonRouter.get('/me', requireAuth, async (req, res) => {
  try {
    const user = req.user
    let courses = []

    if (user.role === 'student') {
      const { data: enrolls } = await supabaseAdmin
        .from('enrollments')
        .select('course_id, courses(*, profiles!courses_faculty_id_fkey(full_name, email), departments(code, name))')
        .eq('student_id', user.id)
        .eq('status', 'active')
      courses = (enrolls || []).map((e) => e.courses).filter(Boolean)
    } else if (user.role === 'faculty') {
      const { data: taught } = await supabaseAdmin
        .from('courses')
        .select('*, departments(code, name)')
        .eq('faculty_id', user.id)
      courses = taught || []
    } else {
      const { data: all } = await supabaseAdmin
        .from('courses')
        .select('*, profiles!courses_faculty_id_fkey(full_name, email), departments(code, name)')
      courses = all || []
    }

    return res.json({
      user,
      courses,
    })
  } catch (err) {
    console.error('GET /api/me error:', err)
    return res.status(500).json({ error: 'Failed to fetch user profile' })
  }
})

// GET /api/departments
commonRouter.get('/departments', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('departments').select('*')
    if (error) throw error
    return res.json({ departments: data || [] })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch departments' })
  }
})

// GET /api/courses
commonRouter.get('/courses', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('*, profiles!courses_faculty_id_fkey(full_name, email), departments(code, name)')
      .order('code', { ascending: true })
    if (error) throw error
    return res.json({ courses: data || [] })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch courses' })
  }
})
