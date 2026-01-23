'use client'

import { useState } from 'react'

interface CardQRCodeProps {
  cardId: string
  shortCode: string
}

export default function CardQRCode({ cardId, shortCode }: CardQRCodeProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const response = await fetch(`/api/cards/${cardId}/qrcode`)
      if (!response.ok) throw new Error('Failed to download QR code')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `card-${shortCode}-qr.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors"
        >
          {showPreview ? 'Hide QR' : 'Show QR'}
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {downloading ? 'Downloading...' : 'Download QR'}
        </button>
      </div>

      {showPreview && (
        <div className="absolute right-0 top-full mt-2 p-3 bg-white rounded-lg shadow-lg border z-10">
          <img
            src={`/api/cards/${cardId}/qrcode?t=${Date.now()}`}
            alt="QR Code"
            width={200}
            height={200}
            className="rounded"
          />
        </div>
      )}
    </div>
  )
}
