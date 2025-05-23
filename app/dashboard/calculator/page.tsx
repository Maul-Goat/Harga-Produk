"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { checkAuth } from "@/lib/auth"
import { addProduct } from "@/lib/products"
import DashboardLayout from "@/components/dashboard-layout"

export default function CalculatorPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    material_cost: 0,
    labor_cost: 0,
    overhead_cost: 0,
    other_cost: 0,
    profit_margin: 20,
  })
  const [sellingPrice, setSellingPrice] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuthenticated = await checkAuth()
      if (!isAuthenticated) {
        router.push("/login")
      }
    }

    checkAuthentication()
  }, [router])

  useEffect(() => {
    calculateSellingPrice()
  }, [formData])

  const handleChange = (e) => {
    const { name, value } = e.target
    const numericValue = name !== "name" ? Number.parseFloat(value) || 0 : value
    setFormData((prev) => ({ ...prev, [name]: numericValue }))
  }

  const calculateSellingPrice = () => {
    const { material_cost, labor_cost, overhead_cost, other_cost, profit_margin } = formData
    const totalCost = material_cost + labor_cost + overhead_cost + other_cost
    const price = totalCost + (totalCost * profit_margin) / 100
    setSellingPrice(price)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const productData = {
        ...formData,
        selling_price: sellingPrice,
      }

      await addProduct(productData)
      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Gagal menyimpan produk. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Kalkulator Harga Jual</CardTitle>
            <CardDescription>
              Masukkan detail biaya produksi dan margin keuntungan untuk menghitung harga jual
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Produk</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="materialCost">Biaya Bahan Baku (Rp)</Label>
                  <Input
                    id="materialCost"
                    name="material_cost"
                    type="number"
                    min="0"
                    value={formData.material_cost || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="laborCost">Biaya Tenaga Kerja (Rp)</Label>
                  <Input
                    id="laborCost"
                    name="labor_cost"
                    type="number"
                    min="0"
                    value={formData.labor_cost || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overheadCost">Biaya Overhead (Rp)</Label>
                  <Input
                    id="overheadCost"
                    name="overhead_cost"
                    type="number"
                    min="0"
                    value={formData.overhead_cost || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherCost">Biaya Lain-lain (Rp)</Label>
                  <Input
                    id="otherCost"
                    name="other_cost"
                    type="number"
                    min="0"
                    value={formData.other_cost || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profitMargin">Margin Keuntungan (%)</Label>
                <Input
                  id="profitMargin"
                  name="profit_margin"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.profit_margin || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Biaya Produksi:</span>
                  <span>
                    Rp{" "}
                    {(
                      formData.material_cost +
                      formData.labor_cost +
                      formData.overhead_cost +
                      formData.other_cost
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Margin Keuntungan:</span>
                  <span>{formData.profit_margin}%</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                  <span>Harga Jual:</span>
                  <span>Rp {sellingPrice.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
              <Button variant="outline" type="button" onClick={() => router.back()} className="w-full sm:w-auto">
                Batal
              </Button>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? "Menyimpan..." : "Simpan Produk"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
