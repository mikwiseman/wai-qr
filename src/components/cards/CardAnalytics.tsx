'use client'

import { useState, useEffect } from 'react'

interface CardAnalyticsProps {
  cardId: string
}

interface Stats {
  totalViews: number
  totalClicks: number
  viewsOverTime: Array<{ date: string; count: number }>
  deviceBreakdown: Array<{ name: string; value: number }>
  geoDistribution: Array<{ country: string; countryCode: string | null; value: number }>
  platformClickBreakdown: Array<{ name: string; value: number }>
}

export default function CardAnalytics({ cardId }: CardAnalyticsProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const response = await fetch(`/api/cards/${cardId}/stats?days=${days}`)
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
  }, [cardId, days])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h2>
        <p className="text-gray-500">Failed to load analytics</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-violet-50 rounded-lg">
          <div className="text-2xl font-bold text-violet-600">{stats.totalViews}</div>
          <div className="text-xs text-gray-600">Views</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalClicks}</div>
          <div className="text-xs text-gray-600">Clicks</div>
        </div>
      </div>

      {/* Device Breakdown */}
      {stats.deviceBreakdown.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Devices</h3>
          <div className="space-y-2">
            {stats.deviceBreakdown.map((item) => {
              const total = stats.deviceBreakdown.reduce((sum, d) => sum + d.value, 0)
              const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0
              return (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-20 capitalize">{item.name}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">{percentage}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top Countries */}
      {stats.geoDistribution.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Top Countries</h3>
          <div className="space-y-1">
            {stats.geoDistribution.slice(0, 5).map((item) => (
              <div key={item.country} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{item.country}</span>
                <span className="text-gray-500">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Links */}
      {stats.platformClickBreakdown.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Link Clicks</h3>
          <div className="space-y-1">
            {stats.platformClickBreakdown.slice(0, 5).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 capitalize">{item.name}</span>
                <span className="text-gray-500">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats.viewsOverTime.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h3>
          <div className="flex items-end gap-1 h-16">
            {stats.viewsOverTime.slice(-14).map((day, i) => {
              const max = Math.max(...stats.viewsOverTime.map(d => d.count), 1)
              const height = (day.count / max) * 100
              return (
                <div
                  key={i}
                  className="flex-1 bg-violet-200 hover:bg-violet-300 rounded-t transition-colors"
                  style={{ height: `${Math.max(height, 4)}%` }}
                  title={`${day.date}: ${day.count} views`}
                />
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{stats.viewsOverTime[Math.max(0, stats.viewsOverTime.length - 14)]?.date}</span>
            <span>{stats.viewsOverTime[stats.viewsOverTime.length - 1]?.date}</span>
          </div>
        </div>
      )}
    </div>
  )
}
