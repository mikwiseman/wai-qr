'use client'

interface DataPoint {
  country: string
  countryCode: string | null
  value: number
}

export default function GeoDistributionChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-black">Geographic Distribution</h3>
        <div className="h-[200px] flex items-center justify-center text-black">
          No geographic data yet
        </div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-black">Geographic Distribution</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">
                Country
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-black uppercase">
                Scans
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-black uppercase">
                Percentage
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-black">
                  {item.countryCode && (
                    <span className="mr-2">
                      {getFlagEmoji(item.countryCode)}
                    </span>
                  )}
                  {item.country}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-black text-right">
                  {item.value}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-black text-right">
                  {((item.value / total) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
