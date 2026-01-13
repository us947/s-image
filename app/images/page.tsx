import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ImageUploadClient from "./image-upload-client"

export const dynamic = "force-dynamic"

export default async function ImagesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <ImageUploadClient userId={user.id} />
}
