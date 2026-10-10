import crypto from 'crypto'

const JWT_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'guni_scholar_secret_jwt_key_2026'

export function signJwt(payload, expiresInSeconds = 7 * 86400) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds
  const fullPayload = { ...payload, exp }

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url')

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url')

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export function verifyJwt(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [encodedHeader, encodedPayload] = parts
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'))

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
