'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteCardButtonProps {
  cardId: string
  cardName: string
}

export default function DeleteCardButton({ cardId, cardName }: DeleteCardButtonProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/dashboard/cards')
        router.refresh()
      } else {
        alert('Failed to delete card')
      }
    } catch (error) {
      console.error('Error deleting card:', error)
      alert('Failed to delete card')
    } finally {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Delete &quot;{cardName}&quot;?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Yes, Delete'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={deleting}
          className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-4 py-2 border border-red-300 hover:bg-red-50 text-red-600 font-medium rounded-lg transition-colors"
    >
      Delete Card
    </button>
  )
}
