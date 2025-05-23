"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { checkAuth } from "@/lib/auth"
import { getProductById, updateProduct, deleteProduct } from "@/lib/products"
import DashboardLayout from "@/components/dashboard-layout"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ProductDetailPage({ params }) {
  const router = useRouter()
  const { id } = params
  const [product, setProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    product_code: "",
    description: "",
    specifications: "",
    material_cost: 0,
    labor_cost: 0,
    overhead_cost: 0,
    other_cost: 0,
    profit_margin: 0,
    selling_price: 0,
    image_url: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")

  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuthenticated = await checkAuth()
      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      try {
        const productData = await getProductById(id)
        if (!productData) {
          router.push("/dashboard/products")
          return
        }
        setProduct(productData)
        setFormData({
          name: productData.name || "",
          product_code: productData.product_code || "",
          description: productData.description || "",
          specifications: productData.specifications || "",
          material_cost: productData.material_cost || 0,
          labor_cost: productData.labor_cost || 0,
          overhead_cost: productData.overhead_cost || 0,
          other_cost: productData.other_cost || 0,
          profit_margin: productData.profit_margin || 0,
          selling_price: productData.selling_price || 0,
          image_url: productData.image_url || "",
        })
        setPreviewUrl(productData.image_url || "")
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthentication()
  }, [id, router])

  useEffect(() => {
    calculateSellingPrice()
  }, [formData.material_cost, formData.labor_cost, formData.overhead_cost, formData.other_cost, formData.profit_margin])

  const handleChange = (e) => {
    const { name, value } = e.target
    const numericFields = ["material_cost", "labor_cost", "overhead_cost", "other_cost", "profit_margin"]
    const numericValue = numericFields.includes(name) ? Number.parseFloat(value) || 0 : value
    setFormData((prev) => ({ ...prev, [name]: numericValue }))
  }

  const calculateSellingPrice = () => {
    const { material_cost, labor_cost, overhead_cost, other_cost, profit_margin } = formData
    const totalCost = material_cost + labor_cost + overhead_cost + other_cost
    const price = totalCost + (totalCost * profit_margin) / 100
    setFormData((prev) => ({ ...prev, selling_price: price }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      let imageUrl = formData.image_url

      // In a real app, you would upload the image to a server here
      // For this local example, we'll just use the data URL
      if (selectedImage) {
        imageUrl = previewUrl
      }

      const updatedProduct = {
        ...product,
        ...formData,
        image_url: imageUrl,
        updatedAt: new Date().toISOString(),
      }

      await updateProduct(id, updatedProduct)
      router.push("/dashboard/products")
    } catch (error) {
      console.error("Error updating product:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteProduct(id)
      router.push("/dashboard/products")
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Detail Produk</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Kembali
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Hapus</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Detail Produk</TabsTrigger>
          <TabsTrigger value="pricing">Harga & Biaya</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Produk</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Produk</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product_code">Kode Produk</Label>
                    <Input
                      id="product_code"
                      name="product_code"
                      value={formData.product_code}
                      onChange={handleChange}
                      placeholder="Masukkan kode produk"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Deskripsi produk"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specifications">Spesifikasi</Label>
                    <Textarea
                      id="specifications"
                      name="specifications"
                      value={formData.specifications}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Spesifikasi produk"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gambar Produk</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="border rounded-lg overflow-hidden w-full h-64 flex items-center justify-center bg-muted/50">
                      {previewUrl ? (
                        <Image
                          src={previewUrl || "/placeholder.svg"}
                          alt={formData.name}
                          width={300}
                          height={300}
                          className="object-contain w-full h-full"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <p className="text-muted-foreground">Belum ada gambar produk</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Unggah Gambar</Label>
                    <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                    <p className="text-sm text-muted-foreground">
                      Format yang didukung: JPG, PNG, GIF. Ukuran maksimal: 5MB
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Perhitungan Harga</CardTitle>
                <CardDescription>
                  Ubah komponen biaya dan margin keuntungan untuk menghitung ulang harga jual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="material_cost">Biaya Bahan Baku (Rp)</Label>
                    <Input
                      id="material_cost"
                      name="material_cost"
                      type="number"
                      min="0"
                      value={formData.material_cost || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="labor_cost">Biaya Tenaga Kerja (Rp)</Label>
                    <Input
                      id="labor_cost"
                      name="labor_cost"
                      type="number"
                      min="0"
                      value={formData.labor_cost || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overhead_cost">Biaya Overhead (Rp)</Label>
                    <Input
                      id="overhead_cost"
                      name="overhead_cost"
                      type="number"
                      min="0"
                      value={formData.overhead_cost || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="other_cost">Biaya Lain-lain (Rp)</Label>
                    <Input
                      id="other_cost"
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
                  <Label htmlFor="profit_margin">Margin Keuntungan (%)</Label>
                  <Input
                    id="profit_margin"
                    name="profit_margin"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.profit_margin || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg">
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
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">Margin Keuntungan:</span>
                    <span>{formData.profit_margin}%</span>
                  </div>
                  <div className="flex justify-between items-center mt-4 text-lg font-bold">
                    <span>Harga Jual:</span>
                    <span>Rp {formData.selling_price.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </Tabs>
    </DashboardLayout>
  )
}
