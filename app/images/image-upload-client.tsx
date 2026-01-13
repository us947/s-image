"use client"

import type React from "react"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, Loader2 } from "lucide-react"

interface ImageUploadClientProps {
  userId: string
}

export default function ImageUploadClient({ userId }: ImageUploadClientProps) {
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type (images only)
    if (!selectedFile.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(selectedFile)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !title) {
      toast({
        title: "Error",
        description: "Please provide both title and image",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const fileName = `${userId}/${Date.now()}-${file.name}`

      const { data: uploadData, error: uploadError } = await supabase.storage.from("images").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        console.error("[v0] Upload error:", uploadError)
        throw new Error(uploadError.message || "Failed to upload image. Make sure the storage bucket exists.")
      }

      const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(fileName)
      const publicUrl = publicUrlData.publicUrl

      const { data: imageData, error: dbError } = await supabase
        .from("images")
        .insert({
          user_id: userId,
          title,
          file_url: publicUrl,
          file_path: fileName,
          file_size: file.size,
          file_type: file.type,
          public_url: publicUrl,
        })
        .select()
        .single()

      if (dbError) throw dbError

      toast({ title: "Success", description: "Image uploaded successfully!" })
      router.push("/dashboard")
    } catch (error: unknown) {
      console.error("[v0] Upload error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <nav className="border-b border-cyan-500/30 bg-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-cyan-400">Upload Image</h1>
          <Link href="/dashboard" className="btn-primary px-6 py-2 rounded-lg font-semibold">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Upload Form */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="mt-8 bg-slate-800/50 border border-cyan-500/30 rounded-lg p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Image Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">
                Image Name
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="My awesome photo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoComplete="off"
                className="bg-slate-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500"
              />
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <Label className="text-gray-300">Select Image</Label>
              <div
                className="relative border-2 border-dashed border-cyan-500/50 rounded-lg p-8 hover:border-cyan-500 transition cursor-pointer bg-slate-700/50"
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <div className="flex flex-col items-center">
                    <img src={preview || "/placeholder.svg"} alt="Preview" className="max-h-48 rounded-lg mb-4" />
                    <p className="text-gray-300">{file?.name}</p>
                    <p className="text-sm text-gray-400">Click to change</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="w-12 h-12 text-cyan-400 mb-4" />
                    <p className="text-gray-300 font-semibold">Click to select or drag and drop</p>
                    <p className="text-sm text-gray-400 mt-2">Supports all image formats (max 10MB)</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading || !file}
                className="btn-primary flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </>
                )}
              </button>
              <Link href="/dashboard" className="btn-danger px-8 py-3 rounded-lg font-semibold">
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Supported Formats</h3>
            <ul className="text-gray-400 space-y-2 text-sm">
              <li>✓ JPEG</li>
              <li>✓ PNG</li>
              <li>✓ WebP</li>
              <li>✓ GIF</li>
              <li>✓ SVG</li>
              <li>✓ BMP</li>
            </ul>
          </div>
          <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Tips</h3>
            <ul className="text-gray-400 space-y-2 text-sm">
              <li>✓ Give your images meaningful names</li>
              <li>✓ Max file size is 10MB</li>
              <li>✓ Images are instantly shareable</li>
              <li>✓ Your images are secure and private</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
