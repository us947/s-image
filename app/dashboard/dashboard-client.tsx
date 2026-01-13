"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useInactivityLogout } from "@/hooks/use-inactivity"
import { Loader2 } from "lucide-react"

interface Image {
  id: string
  title: string
  file_url: string
  public_url: string
  file_size: number
  created_at: string
}

interface DashboardClientProps {
  initialImages: Image[]
  imageCount: number
  userEmail?: string
}

export default function DashboardClient({
  initialImages,
  imageCount: initialImageCount,
  userEmail,
}: DashboardClientProps) {
  useInactivityLogout()

  const [images, setImages] = useState(initialImages)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [imageCount, setImageCount] = useState(initialImageCount)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const filteredImages = images.filter((img) => img.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast({ title: "Success", description: "Logged out successfully" })
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      setIsLoading(true)

      const imageToDelete = images.find((img) => img.id === imageId)
      if (!imageToDelete) return

      // Delete file from Supabase Storage before deleting database record
      if (imageToDelete.file_url) {
        // Extract the file path from the URL
        const filePathMatch = imageToDelete.file_url.match(/\/storage\/v1\/object\/public\/images\/(.+)/)
        const filePath = filePathMatch ? decodeURIComponent(filePathMatch[1]) : null

        if (filePath) {
          try {
            await supabase.storage.from("images").remove([filePath])
          } catch (storageError) {
            console.error("Storage deletion error:", storageError)
            // Continue with database deletion even if storage deletion fails
          }
        }
      }

      // Delete from database
      const { error } = await supabase.from("images").delete().eq("id", imageId)

      if (error) throw error

      // Update local state
      setImages(images.filter((img) => img.id !== imageId))
      setImageCount(imageCount - 1)
      toast({ title: "Success", description: "Image deleted successfully" })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete image",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <nav className="border-b border-cyan-500/30 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">Image Store</h1>
            <p className="text-sm text-gray-400">{userEmail}</p>
          </div>
          <div className="flex gap-4">
            <Link href="/images" className="btn-primary px-6 py-2 rounded-lg font-semibold">
              Upload Image
            </Link>
            <Link href="/settings" className="btn-primary px-6 py-2 rounded-lg font-semibold">
              Settings
            </Link>
            <button onClick={handleLogout} className="btn-danger px-6 py-2 rounded-lg font-semibold">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 my-8">
          <div className="p-6 bg-slate-800/50 border border-cyan-500/30 rounded-lg">
            <p className="text-gray-400 text-sm">Total Images</p>
            <p className="text-4xl font-bold text-cyan-400 mt-2">{imageCount}</p>
          </div>
          <div className="p-6 bg-slate-800/50 border border-cyan-500/30 rounded-lg">
            <p className="text-gray-400 text-sm">Uploaded This Month</p>
            <p className="text-4xl font-bold text-cyan-400 mt-2">
              {
                images.filter((img) => {
                  const createdDate = new Date(img.created_at)
                  const now = new Date()
                  return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
                }).length
              }
            </p>
          </div>
          <div className="p-6 bg-slate-800/50 border border-cyan-500/30 rounded-lg">
            <p className="text-gray-400 text-sm">Total Size</p>
            <p className="text-4xl font-bold text-cyan-400 mt-2">
              {(images.reduce((sum, img) => sum + (img.file_size || 0), 0) / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search images by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                className="bg-slate-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500 h-12"
              />
            </div>
          </div>
        </div>

        {/* Images Grid */}
        {filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">
              {searchQuery ? "No images found matching your search" : "No images yet"}
            </p>
            {!searchQuery && (
              <Link href="/images" className="btn-primary px-8 py-2 rounded-lg font-semibold inline-block">
                Upload Your First Image
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group bg-slate-800/50 border border-cyan-500/30 rounded-lg overflow-hidden hover:border-cyan-500 transition"
              >
                <div className="relative w-full h-48 bg-slate-900 overflow-hidden">
                  <img
                    src={image.file_url || "/placeholder.svg"}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate">{image.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{new Date(image.created_at).toLocaleDateString()}</p>
                  <div className="mt-4 space-y-2">
                    <input
                      type="text"
                      readOnly
                      value={image.public_url}
                      className="w-full text-xs bg-slate-700 border-gray-600 text-gray-300 rounded p-2 cursor-pointer focus:border-violet-500"
                      onClick={(e) => {
                        e.currentTarget.select()
                        navigator.clipboard.writeText(image.public_url)
                        toast({ title: "Success", description: "URL copied to clipboard" })
                      }}
                    />
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={isLoading}
                      className="btn-danger w-full py-2 rounded font-semibold text-sm"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
