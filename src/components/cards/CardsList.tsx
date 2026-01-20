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
  contact_count: number
}

interface CardsListProps {
  cards: CardSummary[]
}

export default function CardsList({ cards: initialCards }: CardsListProps) {
  const [cards, setCards] = useState(initialCards)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://waiqr.xyz'

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this business card? This action cannot be undone.')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCards(cards.filter(card => card.id !== id))
      } else {
        alert('Failed to delete card')
      }
    } catch (error) {
      console.error('Error deleting card:', error)
      alert('Failed to delete card')
    } finally {
      setDeletingId(null)
    }
  }

  const copyCardUrl = (shortCode: string) => {
    const url = `${baseUrl}/c/${shortCode}`
    navigator.clipboard.writeText(url)
    alert('Card URL copied to clipboard!')
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
          <div className="px-6 py-3 bg-gray-50 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">{card.view_count}</div>
              <div className="text-xs text-gray-600">Views</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{card.click_count}</div>
              <div className="text-xs text-gray-600">Clicks</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{card.contact_count}</div>
              <div className="text-xs text-gray-600">Contacts</div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-2">
            <Link
              href={`/dashboard/cards/${card.id}`}
              className="flex-1 text-center py-2 px-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded transition-colors"
            >
              Edit
            </Link>
            <Link
              href={`/c/${card.short_code}`}
              target="_blank"
              className="py-2 px-3 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded transition-colors"
            >
              View
            </Link>
            <button
              onClick={() => copyCardUrl(card.short_code)}
              className="py-2 px-3 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded transition-colors"
              title="Copy URL"
            >
              📋
            </button>
            <button
              onClick={() => handleDelete(card.id)}
              disabled={deletingId === card.id}
              className="py-2 px-3 border border-red-300 hover:bg-red-50 text-red-600 text-sm font-medium rounded transition-colors disabled:opacity-50"
              title="Delete"
            >
              {deletingId === card.id ? '...' : '🗑️'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
