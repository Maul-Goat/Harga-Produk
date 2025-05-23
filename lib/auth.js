import { supabase } from "./supabase"

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  try {
    return (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("supabase")
    )
  } catch (error) {
    console.error("Error checking Supabase config:", error)
    return false
  }
}

export const registerUser = async (email, password, username) => {
  try {
    if (!isSupabaseConfigured()) {
      // Mock registration for development
      console.log("Mock registration:", { email, username })

      // Check if user already exists in mock storage
      if (typeof window !== "undefined") {
        try {
          const existingUsers = JSON.parse(localStorage.getItem("mock-users") || "[]")
          const userExists = existingUsers.some((user) => user.email === email)

          if (userExists) {
            return { success: false, error: "Email sudah terdaftar" }
          }

          // Add new user to mock storage
          const newUser = {
            id: Math.random().toString(36).substring(2, 15),
            email,
            username,
            created_at: new Date().toISOString(),
          }
          existingUsers.push(newUser)
          localStorage.setItem("mock-users", JSON.stringify(existingUsers))
        } catch (storageError) {
          console.error("Storage error:", storageError)
        }
      }

      return { success: true, data: { user: { id: "mock-user-id", email } } }
    }

    // Real Supabase registration
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
    return { success: false, error: error.message || "Terjadi kesalahan saat mendaftar" }
  }
}

export const loginUser = async (email, password) => {
  try {
    if (!isSupabaseConfigured()) {
      // Mock login for development
      console.log("Mock login:", { email })

      if (typeof window !== "undefined") {
        try {
          const existingUsers = JSON.parse(localStorage.getItem("mock-users") || "[]")
          const user = existingUsers.find((u) => u.email === email)

          if (!user) {
            return { success: false, error: "Email tidak terdaftar" }
          }

          // Store mock session
          localStorage.setItem("mock-session", JSON.stringify({ user }))
        } catch (storageError) {
          console.error("Storage error:", storageError)
        }
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
    return { success: false, error: error.message || "Terjadi kesalahan saat login" }
  }
}

export const logoutUser = async () => {
  try {
    if (!isSupabaseConfigured()) {
      // Mock logout for development
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("mock-session")
        } catch (storageError) {
          console.error("Storage error:", storageError)
        }
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
    return { success: false, error: error.message || "Terjadi kesalahan saat logout" }
  }
}

export const checkAuth = async () => {
  try {
    if (!isSupabaseConfigured()) {
      // Mock auth check for development
      if (typeof window !== "undefined") {
        try {
          const mockSession = localStorage.getItem("mock-session")
          return !!mockSession
        } catch (storageError) {
          console.error("Storage error:", storageError)
          return false
        }
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
        try {
          const mockSession = localStorage.getItem("mock-session")
          if (mockSession) {
            const session = JSON.parse(mockSession)
            return {
              id: session.user.id,
              email: session.user.email,
              username: session.user.email,
            }
          }
        } catch (storageError) {
          console.error("Storage error:", storageError)
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
  try {
    return supabase.auth.getUser()
  } catch (error) {
    console.error("Get auth user error:", error)
    return { data: { user: null } }
  }
}
