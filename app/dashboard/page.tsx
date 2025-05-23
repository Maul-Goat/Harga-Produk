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

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isAuthenticated = await checkAuth()
        if (!isAuthenticated) {
          router.push("/login")
          return
        }

        const productData = await getProducts()
        setProducts(productData || [])
        setError("")
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Gagal memuat data produk")
        setProducts([]) // Set empty array on error
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthentication()
  }, [router])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <p>Memuat data...</p>
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
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Harga Jual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.length > 0
                  ? `Rp ${Math.round(
                      products.reduce((acc, product) => acc + (product.selling_price || product.sellingPrice || 0), 0) /
                        products.length,
                    ).toLocaleString("id-ID")}`
                  : "Rp 0"}
              </div>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Margin Rata-rata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.length > 0
                  ? `${Math.round(products.reduce((acc, product) => acc + (product.profit_margin || product.profitMargin || 0), 0) / products.length)}%`
                  : "0%"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Produk Terbaru</h2>
          {products.length === 0 ? (
            <div className="bg-muted/50 rounded-lg p-6 sm:p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Belum ada produk</h3>
              <p className="text-muted-foreground mb-4">Mulai tambahkan produk dengan menghitung harga jual</p>
              <Button asChild>
                <Link href="/dashboard/calculator">Tambah Produk Baru</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.slice(0, 6).map((product) => (
                <Link href={`/dashboard/products/${product.id}`} key={product.id}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg truncate">{product.name}</CardTitle>
                      <CardDescription className="truncate">
                        {product.product_code || product.productCode || `ID: ${product.id.substring(0, 8)}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-sm">Harga Jual:</span>
                          <span className="font-medium text-sm">
                            Rp {(product.selling_price || product.sellingPrice || 0).toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-sm">Margin:</span>
                          <span className="font-medium text-sm">
                            {product.profit_margin || product.profitMargin || 0}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {products.length > 6 && (
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
