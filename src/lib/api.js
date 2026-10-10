import axios from 'axios'
import { supabase } from './supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: Attach Supabase access token on every request
api.interceptors.request.use(
  async (config) => {
    try {
      const { data } = await supabase.auth.getSession()
      const token = data?.session?.access_token || localStorage.getItem('guni.token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (err) {
      console.warn('Failed to attach auth token:', err)
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor: Extract data or format standard errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'API request failed'
    return Promise.reject(new Error(message))
  },
)

export default api
