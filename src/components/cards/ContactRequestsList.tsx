'use client'

import { useState } from 'react'

interface ContactRequest {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  message: string | null
  timestamp: string
  is_read: boolean
  country: string | null
  device_type: string | null
}

interface ContactRequestsListProps {
  cardId: string
  contacts: ContactRequest[]
}

export default function ContactRequestsList({ cardId, contacts: initialContacts }: ContactRequestsListProps) {
  const [contacts, setContacts] = useState(initialContacts)
  const [markingRead, setMarkingRead] = useState<string | null>(null)

  const markAsRead = async (requestId: string) => {
    setMarkingRead(requestId)
    try {
      const response = await fetch(`/api/cards/${cardId}/contact`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestIds: [requestId] }),
      })

      if (response.ok) {
        setContacts(contacts.map(c =>
          c.id === requestId ? { ...c, is_read: true } : c
        ))
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
    } finally {
      setMarkingRead(null)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/cards/${cardId}/contact`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })

      if (response.ok) {
        setContacts(contacts.map(c => ({ ...c, is_read: true })))
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const unreadCount = contacts.filter(c => !c.is_read).length

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">📬</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts yet</h3>
        <p className="text-gray-600">
          When people share their contact info with you, they&apos;ll appear here.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header Actions */}
      {unreadCount > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={markAllAsRead}
            className="text-sm text-violet-600 hover:text-violet-700"
          >
            Mark all as read ({unreadCount})
          </button>
        </div>
      )}

      {/* Contacts List */}
      <div className="space-y-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className={`border rounded-lg p-4 ${
              contact.is_read ? 'bg-white border-gray-200' : 'bg-violet-50 border-violet-200'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                  {!contact.is_read && (
                    <span className="px-2 py-0.5 bg-violet-600 text-white text-xs rounded-full">
                      New
                    </span>
                  )}
                </div>
                {contact.company && (
                  <p className="text-sm text-gray-600">{contact.company}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">{formatDate(contact.timestamp)}</div>
                {contact.country && (
                  <div className="text-xs text-gray-400">{contact.country}</div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 mb-3">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm text-violet-600 hover:text-violet-700"
                >
                  ✉️ {contact.email}
                </a>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="text-sm text-violet-600 hover:text-violet-700"
                >
                  📞 {contact.phone}
                </a>
              )}
            </div>

            {/* Message */}
            {contact.message && (
              <div className="bg-gray-50 rounded p-3 mb-3">
                <p className="text-sm text-gray-700 whitespace-pre-line">{contact.message}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {!contact.is_read && (
                <button
                  onClick={() => markAsRead(contact.id)}
                  disabled={markingRead === contact.id}
                  className="text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  {markingRead === contact.id ? 'Marking...' : 'Mark as read'}
                </button>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}?subject=Re: Nice to meet you`}
                  className="text-xs text-violet-600 hover:text-violet-700"
                >
                  Reply via email
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
