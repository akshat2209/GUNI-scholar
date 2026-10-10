import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)
const USER_KEY = 'guni.user'
const TOKEN_KEY = 'guni.token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
    } catch {
      return null
    }
  })
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
    } catch {
      return null
    }
  })
  const [role, setRole] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem(USER_KEY) || 'null')
      return u?.role || null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  // Fetch full profile from Supabase profiles table
  const fetchProfile = useCallback(async (userId, authUser = null) => {
    if (!userId) return null
    try {
      const { data: prof, error } = await supabase
        .from('profiles')
        .select('*, departments(code, name, institute)')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.warn('Error fetching user profile:', error.message)
      }

      const email = prof?.email || authUser?.email || ''
      const unifiedUser = {
        ...(authUser || {}),
        ...(prof || {}),
        id: prof?.id || userId,
        name: prof?.full_name || email.split('@')[0],
        email,
        role: prof?.role || 'student',
        rollNo: prof?.roll_no,
        department: prof?.departments,
        dept: prof?.departments?.name,
      }

      setUser(unifiedUser)
      setProfile(prof || unifiedUser)
      setRole(prof?.role || 'student')
      localStorage.setItem(USER_KEY, JSON.stringify(unifiedUser))
      return unifiedUser
    } catch (err) {
      console.warn('Profile fetch exception:', err)
      return null
    }
  }, [])

  // Initialize session via supabase.auth.getSession() and subscribe to onAuthStateChange
  useEffect(() => {
    let isMounted = true

    async function initAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.warn('Get session error:', error.message)
        }

        if (session?.user) {
          localStorage.setItem(TOKEN_KEY, session.access_token)
          await fetchProfile(session.user.id, session.user)
        } else {
          // If no active session, clear stored credentials
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          if (isMounted) {
            setUser(null)
            setProfile(null)
            setRole(null)
          }
        }
      } catch (err) {
        console.warn('Auth initialization error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initAuth()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        localStorage.setItem(TOKEN_KEY, session.access_token)
        await fetchProfile(session.user.id, session.user)
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        if (isMounted) {
          setUser(null)
          setProfile(null)
          setRole(null)
        }
      }
      if (isMounted) setLoading(false)
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [fetchProfile])

  // Login via supabase.auth.signInWithPassword
  const login = useCallback(
    async (email, password) => {
      const cleanEmail = email.trim().toLowerCase()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (error) {
        throw new Error(error.message || 'Invalid email or password.')
      }

      if (!data?.user) {
        throw new Error('Authentication succeeded but user was not returned.')
      }

      if (data.session?.access_token) {
        localStorage.setItem(TOKEN_KEY, data.session.access_token)
      }

      const unifiedUser = await fetchProfile(data.user.id, data.user)
      return unifiedUser || { role: 'student' }
    },
    [fetchProfile],
  )

  // Logout via supabase.auth.signOut
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.warn('Sign out error:', err)
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setUser(null)
      setProfile(null)
      setRole(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      role: role || user?.role || null,
      loading,
      login,
      logout,
    }),
    [user, profile, role, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export const roleHome = (role) =>
  ({ student: '/student', faculty: '/faculty', dean: '/dean', admin: '/admin' }[role] || '/')
