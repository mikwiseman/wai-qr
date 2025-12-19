'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImagePicker from './ImagePicker'
import { CenterImageType } from '@/lib/supabase'

export default function QRCodeForm() {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [centerImage, setCenterImage] = useState<{ type: CenterImageType; reference?: string }>({
    type: 'default',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/qrcodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationUrl: url,
          title,
          centerImageType: centerImage.type,
          centerImageRef: centerImage.reference,
        }),
      })

      if (response.ok) {
        setUrl('')
        setTitle('')
        setCenterImage({ type: 'default' })
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create QR code')
      }
    } catch {
      setError('Failed to create QR code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-black">Create New QR Code</h2>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-black">
          Title (optional)
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-500"
          placeholder="My QR Code"
        />
      </div>
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-black">
          Destination URL
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-500"
          placeholder="https://example.com"
          required
        />
      </div>

      <ImagePicker value={centerImage} onChange={setCenterImage} />

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Creating...' : 'Create QR Code'}
      </button>
    </form>
  )
}
