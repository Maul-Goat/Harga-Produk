"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { checkAuth } from "@/lib/auth"
import { getProducts } from "@/lib/products"
import DashboardLayout from "@/components/dashboard-layout"
import { Search } from "lucide-react"

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
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
        setFilteredProducts(productData || [])
        setError("")
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Gagal memuat data produk")
        setProducts([])
        setFilteredProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthentication()
  }, [router])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.product_code && product.product_code.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredProducts(filtered)
    }
  }, [searchTerm, products])

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
          <h1 className="text-2xl font-bold">Daftar Produk</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/dashboard/calculator">Tambah Produk</Link>
            </Button>
          </div>
        </div>

        {error && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>}

        {filteredProducts.length === 0 ? (
          <div className="bg-muted/50 rounded-lg p-6 sm:p-8 text-center">
            <h3 className="text-lg font-medium mb-2">
              {products.length === 0 ? "Belum ada produk" : "Tidak ada produk yang sesuai"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {products.length === 0
                ? "Mulai tambahkan produk dengan menghitung harga jual"
                : "Coba gunakan kata kunci pencarian yang berbeda"}
            </p>
            {products.length === 0 && (
              <Button asChild>
                <Link href="/dashboard/calculator">Tambah Produk Baru</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Nama Produk</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[120px]">Kode Produk</TableHead>
                  <TableHead className="text-right min-w-[120px]">Harga Jual</TableHead>
                  <TableHead className="text-right hidden sm:table-cell min-w-[80px]">Margin</TableHead>
                  <TableHead className="text-right min-w-[80px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.product_code || `ID: ${product.id.substring(0, 8)}`}
                    </TableCell>
                    <TableCell className="text-right">
                      Rp {(product.selling_price || 0).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell">{product.profit_margin || 0}%</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/products/${product.id}`)}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
