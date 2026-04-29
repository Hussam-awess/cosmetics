'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setIsUploading(true)

    try {
      // For now, we'll use a simple approach with FileReader
      // In production, you'd upload to a service like Supabase Storage, Cloudinary, etc.
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        onChange(dataUrl)
        setIsUploading(false)
      }

      reader.onerror = () => {
        alert('Failed to read image file')
        setIsUploading(false)
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  const handleRemove = () => {
    onChange('')
    if (onRemove) onRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (value) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Product Image
        </label>
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-muted">
              <img
                src={value}
                alt="Product preview"
                className="w-full h-full object-cover"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        Product Image
      </label>
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-border'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex flex-col items-center space-y-2">
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
              
              <div className="text-sm text-muted-foreground">
                {isUploading ? (
                  'Uploading image...'
                ) : (
                  <>
                    <p>Drop your image here or</p>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-primary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      browse files
                    </Button>
                  </>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
