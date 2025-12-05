'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint {
  name: string
  value: number
}

interface Props {
  browserData: DataPoint[]
  osData: DataPoint[]
}

export default function BrowserOSChart({ browserData, osData }: Props) {
  const hasBrowserData = browserData.length > 0
  const hasOSData = osData.length > 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Browser Distribution</h3>
        {hasBrowserData ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={browserData} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-500">
            No browser data yet
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Operating System</h3>
        {hasOSData ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={osData} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-500">
            No OS data yet
          </div>
        )}
      </div>
    </div>
  )
}
