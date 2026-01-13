"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "./use-toast"

const INACTIVITY_TIMEOUT = 10 * 60 * 1000 // 10 minutes in milliseconds

export function useInactivityLogout() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  let timeoutId: NodeJS.Timeout | null = null

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Session Expired",
      description: "You have been logged out due to inactivity",
      variant: "destructive",
    })
    router.push("/auth/login")
  }

  const resetTimer = () => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      handleLogout()
    }, INACTIVITY_TIMEOUT)
  }

  useEffect(() => {
    // Set initial timeout
    resetTimer()

    // Add event listeners for user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"]

    const eventListeners = events.map((event) => {
      const listener = () => resetTimer()
      window.addEventListener(event, listener)
      return { event, listener }
    })

    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      eventListeners.forEach(({ event, listener }) => {
        window.removeEventListener(event, listener)
      })
    }
  }, [])
}
