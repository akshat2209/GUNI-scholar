import dotenv from 'dotenv'

dotenv.config()

const backendUrl = `http://localhost:${process.env.PORT || 5000}`

console.log('====================================================')
console.log('       GUNI SCHOLAR BACKEND SMOKE TESTS             ')
console.log('====================================================')

// Helper: build a standard JWT token for smoke testing
function buildTestJwt(email, role, id) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({
      sub: id,
      email,
      role: 'authenticated',
      user_metadata: { role },
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ).toString('base64url')
  const signature = 'test_signature'
  return `${header}.${payload}.${signature}`
}

async function runSmokeTests() {
  let passed = 0
  let failed = 0

  async function test(name, fn) {
    try {
      process.stdout.write(`TEST: ${name} ... `)
      await fn()
      console.log('✅ PASSED')
      passed++
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`)
      failed++
    }
  }

  // Test 1: Health Check
  await test('1. Health Check (GET /api/health)', async () => {
    const res = await fetch(`${backendUrl}/api/health`)
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`)
    const json = await res.json()
    if (json.status !== 'ok') throw new Error(`Unexpected payload: ${JSON.stringify(json)}`)
  })

  // Test 2: Unauthenticated Request Guard
  await test('2. Unauthenticated Guard (GET /api/me without token -> 401)', async () => {
    const res = await fetch(`${backendUrl}/api/me`)
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`)
    const json = await res.json()
    if (!json.error) throw new Error('Missing error message in response')
  })

  // Tokens for demo users in Supabase
  const studentToken = buildTestJwt('aarav.shah@guni.ac.in', 'student', '44444444-4444-4444-4444-444444444401')
  const facultyToken = buildTestJwt('meera.patel@guni.ac.in', 'faculty', '11111111-1111-1111-1111-111111111103')
  const deanToken = buildTestJwt('dean@guni.ac.in', 'dean', '11111111-1111-1111-1111-111111111102')
  const adminToken = buildTestJwt('admin@guni.ac.in', 'admin', '11111111-1111-1111-1111-111111111101')

  // Test 3: Authenticated Student /api/me
  await test('3. Authenticated Student Profile (GET /api/me as Student)', async () => {
    const res = await fetch(`${backendUrl}/api/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`)
    const json = await res.json()
    if (json.user.role !== 'student') throw new Error(`Expected role student, got ${json.user.role}`)
    if (json.user.name !== 'Aarav Shah') throw new Error(`Expected Aarav Shah, got ${json.user.name}`)
  })

  // Test 4: Student Access Enrolled Courses
  await test('4. Student Access Enrolled Courses (GET /api/student/courses)', async () => {
    const res = await fetch(`${backendUrl}/api/student/courses`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`)
    const json = await res.json()
    if (!Array.isArray(json.courses)) throw new Error('Expected courses array')
    if (json.courses.length === 0) throw new Error('Expected student to have enrolled courses')
  })

  // Test 5: Role Guard (Student Calling Faculty Endpoint -> 403 Forbidden)
  await test('5. Role Authorization (Student token calling GET /api/faculty/dashboard -> 403 Forbidden)', async () => {
    const res = await fetch(`${backendUrl}/api/faculty/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`)
    const json = await res.json()
    if (!json.error || !json.error.includes('Forbidden')) throw new Error(`Expected Forbidden error, got: ${json.error}`)
  })

  // Test 6: Faculty Access
  await test('6. Faculty Access (GET /api/faculty/dashboard as Faculty)', async () => {
    const res = await fetch(`${backendUrl}/api/faculty/dashboard`, {
      headers: { Authorization: `Bearer ${facultyToken}` },
    })
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`)
    const json = await res.json()
    if (!Array.isArray(json.courses)) throw new Error('Expected courses array')
  })

  // Test 7: Dean Access
  await test('7. Dean Overview (GET /api/dean/overview as Dean)', async () => {
    const res = await fetch(`${backendUrl}/api/dean/overview`, {
      headers: { Authorization: `Bearer ${deanToken}` },
    })
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`)
    const json = await res.json()
    if (typeof json.totalCourses !== 'number') throw new Error('Expected totalCourses count')
  })

  // Test 8: Admin Access
  await test('8. Admin Overview (GET /api/admin/overview as Admin)', async () => {
    const res = await fetch(`${backendUrl}/api/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`)
    const json = await res.json()
    if (typeof json.totalUsers !== 'number') throw new Error('Expected totalUsers count')
  })

  console.log('\n====================================================')
  console.log(`SMOKE TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED`)
  console.log('====================================================')

  if (failed > 0) process.exit(1)
}

runSmokeTests().catch((e) => {
  console.error('Smoke test runner failed:', e)
  process.exit(1)
})
