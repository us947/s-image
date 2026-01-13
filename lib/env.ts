/**
 * Environment variable validation utility
 * Ensures all required environment variables are present
 */

export function validateEnv() {
  const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar])

  if (missing.length > 0) {
    console.error("[v0] Missing required environment variables:", missing.join(", "))
    throw new Error(
      `Missing environment variables: ${missing.join(", ")}. ` +
        "Please ensure these are set in your deployment platform's environment variables section.",
    )
  }

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  }
}
