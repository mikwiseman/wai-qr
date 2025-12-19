'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { CenterImageType } from '@/lib/supabase'

interface PresetImage {
  id: string
  name: string
  url: string
}

interface UserImage {
  id: string
  url: string
  filename: string
}

interface ImagePickerProps {
  value: { type: CenterImageType; reference?: string }
  onChange: (value: { type: CenterImageType; reference?: string }) => void
}

export default function ImagePicker({ value, onChange }: ImagePickerProps) {
  const [presets, setPresets] = useState<PresetImage[]>([])
  const [userImages, setUserImages] = useState<UserImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load presets
    fetch('/api/images/presets')
      .then(res => res.json())
      .then(data => setPresets(data.presets || []))
      .catch(err => console.error('Failed to load presets:', err))

    // Load user images
    fetch('/api/images')
      .then(res => res.json())
      .then(data => setUserImages(data.images || []))
      .catch(err => console.error('Failed to load user images:', err))
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setError('Please upload a PNG or JPEG image')
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB')
      return
    }

    setError('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        const newImage: UserImage = {
          id: data.id,
          url: data.url,
          filename: file.name,
        }
        setUserImages(prev => [newImage, ...prev])
        onChange({ type: 'custom', reference: data.url })
      } else {
        setError(data.error || 'Failed to upload image')
      }
    } catch {
      setError('Failed to upload image')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const isSelected = (type: CenterImageType, reference?: string) => {
    if (type !== value.type) return false
    if (type === 'none' || type === 'default') return true
    return reference === value.reference
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-black">
        Center Image
      </label>

      {/* No Logo / Default Options */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => onChange({ type: 'none' })}
          className={`flex flex-col items-center p-3 border-2 rounded-lg transition-colors ${
            isSelected('none')
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-black">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="text-xs text-black mt-1">No Logo</span>
        </button>

        <button
          type="button"
          onClick={() => onChange({ type: 'default' })}
          className={`flex flex-col items-center p-3 border-2 rounded-lg transition-colors ${
            isSelected('default')
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="w-12 h-12 bg-white rounded overflow-hidden">
            <Image
              src="/presets/default.png"
              alt="Default logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <span className="text-xs text-black mt-1">Default</span>
        </button>
      </div>

      {/* Presets */}
      {presets.length > 0 && (
        <div>
          <p className="text-sm text-black mb-2">Presets</p>
          <div className="flex flex-wrap gap-2">
            {presets.filter(p => p.id !== 'default').map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange({ type: 'preset', reference: preset.id })}
                className={`flex flex-col items-center p-2 border-2 rounded-lg transition-colors ${
                  isSelected('preset', preset.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 bg-white rounded overflow-hidden">
                  <Image
                    src={preset.url}
                    alt={preset.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs text-black mt-1">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div>
        <p className="text-sm text-black mb-2">Upload Custom</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm text-black hover:bg-gray-50 cursor-pointer ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Image
            </>
          )}
        </label>
        <p className="text-xs text-black mt-1">PNG or JPEG, max 2MB</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* User Uploaded Images */}
      {userImages.length > 0 && (
        <div>
          <p className="text-sm text-black mb-2">Your Uploads</p>
          <div className="flex flex-wrap gap-2">
            {userImages.map(image => (
              <button
                key={image.id}
                type="button"
                onClick={() => onChange({ type: 'custom', reference: image.url })}
                className={`p-2 border-2 rounded-lg transition-colors ${
                  isSelected('custom', image.url)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 bg-white rounded overflow-hidden">
                  <Image
                    src={image.url}
                    alt={image.filename}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
