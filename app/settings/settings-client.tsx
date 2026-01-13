"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface SettingsClientProps {
  user: any
  userData: any
  userEmail: string
}

export default function SettingsClient({ user, userData, userEmail }: SettingsClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Username update state
  const [newUsername, setNewUsername] = useState(userData?.username || "")
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false)

  // Email change state
  const [newEmail, setNewEmail] = useState("")
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // Delete account state
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUsername.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUpdatingUsername(true)
      const { error } = await supabase.from("users").update({ username: newUsername.toLowerCase() }).eq("id", user.id)

      if (error) throw error
      toast({ title: "Success", description: "Username updated successfully" })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update username",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingUsername(false)
    }
  }

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim()) {
      toast({
        title: "Error",
        description: "Email cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUpdatingEmail(true)
      const { error } = await supabase.auth.updateUser({ email: newEmail })

      if (error) throw error
      toast({
        title: "Success",
        description: "Email change initiated. Check your new email to confirm.",
      })
      setNewEmail("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change email",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUpdatingPassword(true)
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      // Update password_changed_at in users table
      await supabase.from("users").update({ password_changed_at: new Date().toISOString() }).eq("id", user.id)

      toast({ title: "Success", description: "Password changed successfully" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()

    if (deleteConfirmation !== "DELETE") {
      toast({
        title: "Error",
        description: 'Type "DELETE" to confirm account deletion',
        variant: "destructive",
      })
      return
    }

    try {
      setIsDeletingAccount(true)

      // Delete user account from Supabase Auth
      const { error } = await supabase.auth.admin.deleteUser(user.id)

      if (error) throw error

      toast({ title: "Success", description: "Account deleted successfully" })
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive",
      })
    } finally {
      setIsDeletingAccount(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <nav className="border-b border-cyan-500/30 bg-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-cyan-400">Settings</h1>
          <div className="flex gap-4">
            <Link href="/dashboard" className="btn-primary px-6 py-2 rounded-lg font-semibold text-sm">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* Current Email */}
        <div className="p-6 bg-slate-800/50 border border-cyan-500/30 rounded-lg mb-6">
          <p className="text-gray-400 text-sm">Current Email</p>
          <p className="text-lg font-semibold text-cyan-400 mt-2">{userEmail}</p>
        </div>

        {/* Update Username */}
        <div className="p-6 bg-slate-800/50 border border-cyan-500/30 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Update Username</h2>
          <form onSubmit={handleUpdateUsername} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">New Username</label>
              <Input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
                autoComplete="off"
                className="bg-slate-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500"
              />
            </div>
            <button
              type="submit"
              disabled={isUpdatingUsername}
              className="btn-primary px-6 py-2 rounded-lg font-semibold"
            >
              {isUpdatingUsername ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Username"}
            </button>
          </form>
        </div>

        {/* Change Email */}
        <div className="p-6 bg-slate-800/50 border border-cyan-500/30 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Change Email</h2>
          <form onSubmit={handleChangeEmail} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">New Email</label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
                autoComplete="off"
                className="bg-slate-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500"
              />
            </div>
            <button type="submit" disabled={isUpdatingEmail} className="btn-primary px-6 py-2 rounded-lg font-semibold">
              {isUpdatingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : "Change Email"}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="p-6 bg-slate-800/50 border border-cyan-500/30 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="off"
                className="bg-slate-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Confirm Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="off"
                className="bg-slate-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500"
              />
            </div>
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="btn-primary px-6 py-2 rounded-lg font-semibold"
            >
              {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Change Password"}
            </button>
          </form>
        </div>

        {/* Delete Account */}
        <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-lg">
          <h2 className="text-xl font-bold text-red-400 mb-4">Delete Account</h2>
          <p className="text-gray-400 mb-4">
            This action cannot be undone. All your images and data will be permanently deleted.
          </p>
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Type "DELETE" to confirm</label>
              <Input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type DELETE"
                autoComplete="off"
                className="bg-slate-700 border-red-600 text-white placeholder-gray-400 focus:border-red-500"
              />
            </div>
            <button
              type="submit"
              disabled={isDeletingAccount}
              className="btn-danger px-6 py-2 rounded-lg font-semibold"
            >
              {isDeletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
