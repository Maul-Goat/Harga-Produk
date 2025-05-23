"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { checkAuth } from "@/lib/auth"
import { getProducts } from "@/lib/products"
import DashboardLayout from "@/components/dashboard-layout"

export default function DashboardPage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before running effects
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkAuthentication = async () => {
      try {
        const isAuthenticated = await checkAuth()
        if (!isAuthenticated) {
          router.push("/login")
          return
        }

        try {
          const productData = await getProducts()
          setProducts(Array.isArray(productData) ? productData : [])
          setError("")
        } catch (fetchError) {
          console.error("Error fetching products:", fetchError)
          setError("Gagal memuat data produk")
          setProducts([])
        }
      } catch (authError) {
        console.error("Authentication error:", authError)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthentication()
  }, [router, mounted])

  // Helper function to safely get numeric values
  const safeNumber = (value) => {
    if (value === null || value === undefined || value === "") return 0
    const num = Number.parseFloat(value)
    return isNaN(num) ? 0 : num
  }

  // Calculate average selling price safely
  const calculateAveragePrice = () => {
    if (!products || !Array.isArray(products) || products.length === 0) return 0

    try {
      const total = products.reduce((acc, product) => {
        if (!product) return acc
        const price = safeNumber(product.selling_price || product.sellingPrice)
        return acc + price
      }, 0)

      return Math.round(total / products.length)
    } catch (error) {
      console.error("Error calculating average price:", error)
      return 0
    }
  }

  // Calculate average margin safely
  const calculateAverageMargin = () => {
    if (!products || !Array.isArray(products) || products.length === 0) return 0

    try {
      const total = products.reduce((acc, product) => {
        if (!product) return acc
        const margin = safeNumber(product.profit_margin || product.profitMargin)
        return acc + margin
      }, 0)

      return Math.round(total / products.length)
    } catch (error) {
      console.error("Error calculating average margin:", error)
      return 0
    }
  }

  // Don't render anything until mounted (prevents hydration issues)
  if (!mounted) {
    return null
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Memuat data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button asChild>
            <Link href="/dashboard/calculator">Tambah Produk Baru</Link>
          </Button>
        </div>

        {error && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Harga Jual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products?.length > 0 ? `Rp ${calculateAveragePrice().toLocaleString("id-ID")}` : "Rp 0"}
              </div>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Margin Rata-rata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products?.length > 0 ? `${calculateAverageMargin()}%` : "0%"}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Produk Terbaru</h2>
          {!products || products.length === 0 ? (
            <div className="bg-muted/50 rounded-lg p-6 sm:p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Belum ada produk</h3>
              <p className="text-muted-foreground mb-4">Mulai tambahkan produk dengan menghitung harga jual</p>
              <Button asChild>
                <Link href="/dashboard/calculator">Tambah Produk Baru</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.slice(0, 6).map((product) => {
                if (!product || !product.id) return null

                return (
                  <Link href={`/dashboard/products/${product.id}`} key={product.id}>
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg truncate">{product.name || "Produk Tanpa Nama"}</CardTitle>
                        <CardDescription className="truncate">
                          {product.product_code || product.productCode || `ID: ${String(product.id).substring(0, 8)}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground text-sm">Harga Jual:</span>
                            <span className="font-medium text-sm">
                              Rp {safeNumber(product.selling_price || product.sellingPrice).toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground text-sm">Margin:</span>
                            <span className="font-medium text-sm">
                              {safeNumber(product.profit_margin || product.profitMargin)}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}

          {products?.length > 6 && (
            <div className="text-center mt-4">
              <Button asChild variant="outline">
                <Link href="/dashboard/products">Lihat Semua Produk</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
