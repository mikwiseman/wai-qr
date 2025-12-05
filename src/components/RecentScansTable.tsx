'use client'

import { Scan } from '@/lib/supabase'

export default function RecentScansTable({ scans }: { scans: Scan[] }) {
  if (scans.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Scans</h3>
        <div className="text-center text-gray-500 py-8">No scans yet</div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Scans</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Time
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Device
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Browser
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                OS
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Location
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scans.map((scan) => (
              <tr key={scan.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {new Date(scan.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      scan.device_type === 'mobile'
                        ? 'bg-blue-100 text-blue-800'
                        : scan.device_type === 'tablet'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {scan.device_type || 'Unknown'}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {scan.browser || 'Unknown'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {scan.os || 'Unknown'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {scan.city && scan.country
                    ? `${scan.city}, ${scan.country}`
                    : scan.country || 'Unknown'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
