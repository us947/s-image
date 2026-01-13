import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardClient from "./dashboard-client"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  try {
    // Fetch user's images with LIMIT and pagination for better performance
    const { data: images, error } = await supabase
      .from("images")
      .select("id, title, file_url, public_url, file_size, created_at, slug")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1000)

    if (error) {
      console.error("[v0] Error fetching images:", error)
      // Show empty state instead of crashing
      return <DashboardClient initialImages={[]} imageCount={0} userEmail={user.email} />
    }

    const imageCount = images?.length || 0

    return <DashboardClient initialImages={images || []} imageCount={imageCount} userEmail={user.email} />
  } catch (error) {
    console.error("[v0] Unexpected error in DashboardPage:", error)
    // Fallback to empty state on error
    return <DashboardClient initialImages={[]} imageCount={0} userEmail={user.email} />
  }
}
