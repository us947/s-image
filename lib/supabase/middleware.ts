import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Missing Supabase environment variables")
    // Let request pass through instead of blocking
    return NextResponse.next()
  }

  try {
    const supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    })

    try {
      await supabase.auth.getUser()
    } catch (authError) {
      console.error("[v0] Auth check failed:", authError)
      // Continue anyway - let route handle auth
    }

    return supabaseResponse
  } catch (error) {
    console.error("[v0] Middleware error:", error)
    // Let request pass through instead of returning 500
    return NextResponse.next()
  }
}
