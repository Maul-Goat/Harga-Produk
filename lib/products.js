import { supabase } from "./supabase"

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("supabase")
  )
}

// Mock data for development
const getMockProducts = () => {
  if (typeof window !== "undefined") {
    const mockProducts = localStorage.getItem("mock-products")
    return mockProducts ? JSON.parse(mockProducts) : []
  }
  return []
}

const setMockProducts = (products) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("mock-products", JSON.stringify(products))
  }
}

export const getProducts = async () => {
  try {
    if (!isSupabaseConfigured()) {
      // Return mock products for development
      return getMockProducts()
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Get products error:", error)
    throw error
  }
}

export const getProductById = async (id) => {
  try {
    if (!isSupabaseConfigured()) {
      // Return mock product for development
      const products = getMockProducts()
      return products.find((p) => p.id === id) || null
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase.from("products").select("*").eq("id", id).eq("user_id", user.id).single()

    if (error) {
      console.error("Error fetching product:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Get product by ID error:", error)
    throw error
  }
}

export const addProduct = async (productData) => {
  try {
    if (!isSupabaseConfigured()) {
      // Add to mock products for development
      const products = getMockProducts()
      const newProduct = {
        ...productData,
        id: Math.random().toString(36).substring(2, 15),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      products.unshift(newProduct)
      setMockProducts(products)
      return newProduct
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          ...productData,
          user_id: user.id,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error adding product:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Add product error:", error)
    throw error
  }
}

export const updateProduct = async (id, productData) => {
  try {
    if (!isSupabaseConfigured()) {
      // Update mock product for development
      const products = getMockProducts()
      const index = products.findIndex((p) => p.id === id)
      if (index !== -1) {
        products[index] = { ...products[index], ...productData, updated_at: new Date().toISOString() }
        setMockProducts(products)
        return products[index]
      }
      return null
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Remove user_id from update data to prevent conflicts
    const { user_id, ...updateData } = productData

    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating product:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Update product error:", error)
    throw error
  }
}

export const deleteProduct = async (id) => {
  try {
    if (!isSupabaseConfigured()) {
      // Delete from mock products for development
      const products = getMockProducts()
      const filteredProducts = products.filter((p) => p.id !== id)
      setMockProducts(filteredProducts)
      return true
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { error } = await supabase.from("products").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting product:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Delete product error:", error)
    throw error
  }
}

// Helper function to upload image to Supabase Storage
export const uploadProductImage = async (file, productId) => {
  try {
    if (!isSupabaseConfigured()) {
      // Mock image upload for development
      return URL.createObjectURL(file)
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `${productId}-${Date.now()}.${fileExt}`
    const filePath = `product-images/${fileName}`

    const { data, error } = await supabase.storage.from("products").upload(filePath, file)

    if (error) {
      console.error("Error uploading image:", error)
      throw error
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error("Upload image error:", error)
    throw error
  }
}
