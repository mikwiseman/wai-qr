'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface CardSummary {
  id: string
  short_code: string
  display_name: string
  headline: string | null
  avatar_url: string | null
  theme_style: string
  is_active: boolean
  created_at: string
  view_count: number
  click_count: number
}

interface CardsListProps {
  cards: CardSummary[]
}

export default function CardsList({ cards: initialCards }: CardsListProps) {
  const [cards, setCards] = useState(initialCards)

  const handleDownloadQR = async (cardId: string, shortCode: string) => {
    try {
      const response = await fetch(`/api/cards/${cardId}/qrcode`)
      if (!response.ok) throw new Error('Failed to download')
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
    }
  }

  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">💼</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No business cards yet</h3>
        <p className="text-gray-600 mb-6">Create your first digital business card to share your contact info</p>
        <Link
          href="/dashboard/cards/new"
          className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Create Your First Card
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
        >
          {/* Card Header */}
          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                {card.avatar_url ? (
                  <Image
                    src={card.avatar_url}
                    alt={card.display_name}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                    {card.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {card.display_name}
                </h3>
                {card.headline && (
                  <p className="text-sm text-gray-600 truncate">{card.headline}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    card.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {card.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-gray-500">{card.theme_style}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-6 py-3 bg-gray-50 grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">{card.view_count}</div>
              <div className="text-xs text-gray-600">Views</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{card.click_count}</div>
              <div className="text-xs text-gray-600">Clicks</div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-2">
            <Link
              href={`/c/${card.short_code}`}
              target="_blank"
              className="flex-1 text-center py-2 px-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded transition-colors"
            >
              View
            </Link>
            <Link
              href={`/dashboard/cards/${card.id}/stats`}
              className="py-2 px-3 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded transition-colors"
            >
              Stats
            </Link>
            <Link
              href={`/dashboard/cards/${card.id}`}
              className="py-2 px-3 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDownloadQR(card.id, card.short_code)}
              className="py-2 px-3 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded transition-colors"
              title="Download QR Code"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
