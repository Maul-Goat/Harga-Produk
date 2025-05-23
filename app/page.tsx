import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto py-4">
          <h1 className="text-2xl font-bold">Sistem Manajemen Produk</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-12">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold tracking-tight">Kelola Produk dan Hitung Harga Jual</h2>
          <p className="text-xl text-muted-foreground">
            Platform untuk menghitung harga jual produk berdasarkan biaya produksi dan margin keuntungan yang
            diinginkan.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/register">Daftar</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Hitung Harga Jual</h3>
              <p className="text-muted-foreground">
                Hitung harga jual produk berdasarkan biaya bahan baku, tenaga kerja, overhead, dan margin keuntungan.
              </p>
            </div>
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Kelola Produk</h3>
              <p className="text-muted-foreground">
                Simpan dan kelola informasi produk termasuk gambar, kode, deskripsi, dan spesifikasi.
              </p>
            </div>
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Pantau Inventaris</h3>
              <p className="text-muted-foreground">Lihat daftar semua produk dan perbarui informasi kapan saja.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Sistem Manajemen Produk
        </div>
      </footer>
    </div>
  )
}
