'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { QRCode } from '@/lib/supabase'

interface QRCodeWithCount extends QRCode {
  scan_count: number
}

export default function QRCodeList({ qrCodes }: { qrCodes: QRCodeWithCount[] }) {
  const router = useRouter()

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete QR code "${title || 'Untitled'}"?`)) return

    try {
      const response = await fetch(`/api/qrcodes/${id}`, { method: 'DELETE' })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  if (qrCodes.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center text-black">
        No QR codes yet. Create one to get started!
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Destination
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Scans
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {qrCodes.map((qr) => (
            <tr key={qr.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <Link
                  href={`/dashboard/${qr.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {qr.title || 'Untitled'}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-black max-w-xs truncate">
                <a
                  href={qr.destination_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black"
                >
                  {qr.destination_url}
                </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {qr.scan_count}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                {new Date(qr.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    qr.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {qr.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <Link
                  href={`/dashboard/${qr.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  View
                </Link>
                <button
                  onClick={() => handleDelete(qr.id, qr.title || '')}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
