import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { commonRouter } from './routes/common.js'
import { studentRouter } from './routes/student.js'
import { facultyRouter } from './routes/faculty.js'
import { deanRouter } from './routes/dean.js'
import { adminRouter } from './routes/admin.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
)
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'GUNI Scholar Backend API',
  })
})

// Route Modules
app.use('/api', commonRouter)
app.use('/api/student', studentRouter)
app.use('/api/faculty', facultyRouter)
app.use('/api/dean', deanRouter)
app.use('/api/admin', adminRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  })
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[GUNI Scholar Backend] Server running on http://localhost:${PORT}`)
    console.log(`[GUNI Scholar Backend] Accepting requests from: ${CORS_ORIGIN}`)
  })
}

export default app
