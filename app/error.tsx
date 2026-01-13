"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Error caught by error boundary:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Something went wrong</h1>
        <p className="text-gray-300 mb-6">{error.message || "An unexpected error occurred"}</p>
        <button
          onClick={() => reset()}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-all hover:shadow-lg hover:shadow-cyan-600 border border-cyan-500 text-cyan-500 px-6 py-2 rounded-lg font-semibold"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
