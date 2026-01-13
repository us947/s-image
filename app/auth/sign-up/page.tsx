"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function SignUpPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || username.length < 3) {
      toast({
        title: "Error",
        description: "Username must be at least 3 characters",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (authError) throw authError

      if (authData.user) {
        const response = await fetch("/api/auth/handle-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: authData.user, username: username.toLowerCase() }),
        })
        if (!response.ok) throw new Error("Failed to save username")
      }

      toast({ title: "Success", description: "Account created! Please check your email to confirm." })
      router.push("/auth/login")
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-slate-800 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-400 text-center">Sign Up</CardTitle>
          <CardDescription className="text-gray-400 text-center">Create your account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                required
                minLength={3}
                maxLength={50}
                autoComplete="off"
                className="bg-slate-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500"
              />
              <p className="text-xs text-gray-500">3-50 characters, lowercase</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                className="bg-slate-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="off"
                className="bg-slate-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-gray-300">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="off"
                className="bg-slate-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500"
              />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full py-2 rounded-lg font-semibold">
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
