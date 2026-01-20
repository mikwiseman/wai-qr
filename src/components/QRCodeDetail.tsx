'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { QRCodeWithDetails } from '@/lib/types'
import ScansOverTimeChart from './charts/ScansOverTimeChart'
import DeviceBreakdownChart from './charts/DeviceBreakdownChart'
import BrowserOSChart from './charts/BrowserOSChart'
import GeoDistributionChart from './charts/GeoDistributionChart'
import RecentScansTable from './RecentScansTable'

interface Stats {
  totalScans: number
  scansOverTime: { date: string; count: number }[]
  deviceBreakdown: { name: string; value: number }[]
  browserBreakdown: { name: string; value: number }[]
  osBreakdown: { name: string; value: number }[]
  geoDistribution: { country: string; countryCode: string | null; value: number }[]
  recentScans: unknown[]
}

export default function QRCodeDetail({ qrCode }: { qrCode: QRCodeWithDetails }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/qrcodes/${qrCode.id}/stats`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [qrCode.id])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = `/api/qr/${qrCode.short_code}`
    link.download = `qrcode-${qrCode.short_code}.png`
    link.click()
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrCode.redirectUrl)
    alert('Link copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-black">{qrCode.title || 'Untitled QR Code'}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col items-center">
            <Image
              src={qrCode.qrImageDataUrl}
              alt="QR Code"
              width={200}
              height={200}
              className="mb-4"
            />
            <div className="text-center mb-4">
              <p className="text-sm text-black mb-1">Redirect URL:</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all text-black">
                {qrCode.redirectUrl}
              </code>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Download PNG
              </button>
              <button
                onClick={handleCopyLink}
                className="bg-gray-100 text-black px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-black">Details</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-black">Destination URL</dt>
              <dd className="text-sm font-medium text-black break-all">
                <a
                  href={qrCode.destination_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {qrCode.destination_url}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-black">Total Scans</dt>
              <dd className="text-2xl font-bold text-blue-600">{stats?.totalScans || 0}</dd>
            </div>
            <div>
              <dt className="text-sm text-black">Created</dt>
              <dd className="text-sm font-medium text-black">
                {new Date(qrCode.created_at).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-black">Status</dt>
              <dd>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    qrCode.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {qrCode.is_active ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-black">Loading analytics...</div>
      ) : stats ? (
        <>
          <ScansOverTimeChart data={stats.scansOverTime} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DeviceBreakdownChart data={stats.deviceBreakdown} />
            <GeoDistributionChart data={stats.geoDistribution} />
          </div>

          <BrowserOSChart browserData={stats.browserBreakdown} osData={stats.osBreakdown} />

          <RecentScansTable scans={stats.recentScans as never[]} />
        </>
      ) : (
        <div className="text-center py-12 text-black">Failed to load analytics</div>
      )}
    </div>
  )
}
