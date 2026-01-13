import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SettingsClient from "./settings-client"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's current data
  const { data: userData, error } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching user data:", error)
  }

  return <SettingsClient user={user} userData={userData} userEmail={user.email || ""} />
}
