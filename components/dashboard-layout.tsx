"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { logoutUser } from "@/lib/auth"
import { Calculator, Home, Menu, Package, LogOut } from "lucide-react"

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      await logoutUser()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/login")
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Kalkulator Harga", href: "/dashboard/calculator", icon: Calculator },
    { name: "Daftar Produk", href: "/dashboard/products", icon: Package },
  ]

  const handleNavClick = (href) => {
    setIsSheetOpen(false)
    router.push(href)
  }

  if (!isMounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 font-semibold">
                <Package className="h-6 w-6" />
                <span className="hidden sm:inline-block">Sistem Manajemen Produk</span>
                <span className="sm:hidden">SMP</span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-[50vh]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <nav className="grid gap-2 text-lg font-medium">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left w-full ${
                          pathname === item.href
                            ? "bg-muted text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </button>
                    )
                  })}
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground justify-start text-lg font-medium"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                    Keluar
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Package className="h-6 w-6" />
              <span className="hidden sm:inline-block">Sistem Manajemen Produk</span>
              <span className="sm:hidden">SMP</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium ${
                    pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1">
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
