import { supabase } from "./supabase"

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("supabase")
  )
}

export const registerUser = async (email, password, username) => {
  try {
    if (!isSupabaseConfigured()) {
      // Mock success for development
      console.log("Mock registration:", { email, username })
      return { success: true, data: { user: { id: "mock-user-id", email } } }
    }

    // Sign up user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.error("Registration error:", error)
      return { success: false, error: error.message }
    }

    if (data.user) {
      // Update profile with username
      const { error: profileError } = await supabase.from("profiles").update({ username }).eq("id", data.user.id)

      if (profileError) {
        console.error("Profile update error:", profileError)
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: error.message }
  }
}

export const loginUser = async (email, password) => {
  try {
    if (!isSupabaseConfigured()) {
      // Mock login for development
      console.log("Mock login:", { email })
      // Store mock session in localStorage for development
      if (typeof window !== "undefined") {
        localStorage.setItem("mock-session", JSON.stringify({ user: { id: "mock-user-id", email } }))
      }
      return { success: true, data: { user: { id: "mock-user-id", email } } }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Login error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: error.message }
  }
}

export const logoutUser = async () => {
  try {
    if (!isSupabaseConfigured()) {
      // Mock logout for development
      if (typeof window !== "undefined") {
        localStorage.removeItem("mock-session")
      }
      return { success: true }
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Logout error:", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false, error: error.message }
  }
}

export const checkAuth = async () => {
  try {
    if (!isSupabaseConfigured()) {
      // Mock auth check for development
      if (typeof window !== "undefined") {
        const mockSession = localStorage.getItem("mock-session")
        return !!mockSession
      }
      return false
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()
    return !!session
  } catch (error) {
    console.error("Auth check error:", error)
    return false
  }
}

export const getCurrentUser = async () => {
  try {
    if (!isSupabaseConfigured()) {
      // Mock user for development
      if (typeof window !== "undefined") {
        const mockSession = localStorage.getItem("mock-session")
        if (mockSession) {
          const session = JSON.parse(mockSession)
          return {
            id: session.user.id,
            email: session.user.email,
            username: session.user.email,
          }
        }
      }
      return null
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Get profile information
      const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single()

      return {
        id: user.id,
        email: user.email,
        username: profile?.username || user.email,
      }
    }

    return null
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export const getAuthUser = () => {
  return supabase.auth.getUser()
}
