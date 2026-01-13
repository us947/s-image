import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-cyan-400 mb-4">404</h1>
        <p className="text-gray-300 mb-6">Page not found</p>
        <Link
          href="/"
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-all hover:shadow-lg hover:shadow-cyan-600 border border-cyan-500 text-cyan-500 px-6 py-2 rounded-lg font-semibold inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
