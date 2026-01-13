import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
            Image Store
          </h1>
          <p className="text-xl text-gray-300">Upload, organize, and share your images with shareable URLs</p>
        </div>

        <div className="flex gap-6 justify-center mb-16">
          <Link
            href="/auth/login"
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-all hover:shadow-lg hover:shadow-cyan-600 border border-cyan-500 text-cyan-500 hover:text-cyan-500 cursor-pointer px-8 py-3 rounded-lg font-semibold"
          >
            Login
          </Link>
          <Link
            href="/auth/sign-up"
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-all hover:shadow-lg hover:shadow-cyan-600 border border-cyan-500 text-cyan-500 hover:text-cyan-500 cursor-pointer px-8 py-3 rounded-lg font-semibold"
          >
            Sign Up
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-800/50 border border-cyan-500/30 rounded-lg hover:border-cyan-500/60 transition-colors">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Easy Upload</h3>
            <p className="text-gray-400">Upload any image format and get instant shareable links</p>
          </div>
          <div className="p-6 bg-slate-800/50 border border-cyan-500/30 rounded-lg hover:border-cyan-500/60 transition-colors">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Organize</h3>
            <p className="text-gray-400">Manage your images in a beautiful dashboard</p>
          </div>
          <div className="p-6 bg-slate-800/50 border border-cyan-500/30 rounded-lg hover:border-cyan-500/60 transition-colors">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Share Easily</h3>
            <p className="text-gray-400">Copy and share image URLs like a blog post</p>
          </div>
          <div className="p-6 bg-slate-800/50 border border-cyan-500/30 rounded-lg hover:border-cyan-500/60 transition-colors">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Secure</h3>
            <p className="text-gray-400">Your images are safe and private to you</p>
          </div>
        </div>
      </div>
    </div>
  )
}
