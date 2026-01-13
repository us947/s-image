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

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let loginEmail = identifier

      if (!identifier.includes("@")) {
        const supabase = createClient()
        const { data: userData, error: queryError } = await supabase.rpc("get_user_email_by_username", {
          p_username: identifier.toLowerCase(),
        })

        if (queryError) {
          console.log("[v0] Username lookup error:", queryError.message)
          throw new Error("Username not found")
        }

        if (userData && userData.length > 0 && userData[0].email) {
          loginEmail = userData[0].email
        } else {
          throw new Error("Username not found")
        }
      }

      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      })

      if (error) throw error
      toast({ title: "Success", description: "Logged in successfully" })
      router.push("/dashboard")
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid credentials",
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
          <CardTitle className="text-cyan-400 text-center">Login</CardTitle>
          <CardDescription className="text-gray-400 text-center">
            Enter your email or username to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-gray-300">
                Email or Username
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="you@example.com or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
            <button type="submit" disabled={isLoading} className="btn-primary w-full py-2 rounded-lg font-semibold">
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="text-cyan-400 hover:text-cyan-300">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
