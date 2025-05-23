"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { registerUser } from "@/lib/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Password tidak cocok")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter")
      setIsLoading(false)
      return
    }

    try {
      const result = await registerUser(email, password, username)
      if (result.success) {
        setError("")
        alert("Registrasi berhasil! Silakan login dengan akun Anda.")
        router.push("/login")
      } else {
        setError(result.error || "Terjadi kesalahan saat mendaftar")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("Terjadi kesalahan saat mendaftar")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Daftar</CardTitle>
          <CardDescription>Buat akun baru untuk menggunakan sistem manajemen produk</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div
                className={`text-sm p-3 rounded-md ${
                  error.includes("berhasil")
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-destructive/15 text-destructive"
                }`}
              >
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Daftar"}
            </Button>
            <div className="text-center text-sm">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Masuk
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
