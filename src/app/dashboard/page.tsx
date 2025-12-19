import { createSupabase } from '@/lib/supabase'
import QRCodeForm from '@/components/QRCodeForm'
import QRCodeList from '@/components/QRCodeList'

export const dynamic = 'force-dynamic'

async function getQRCodes() {
  const supabase = createSupabase()

  const { data: qrCodes, error } = await supabase
    .from('qr_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching QR codes:', error)
    return []
  }

  // Get scan counts for each QR code
  const qrCodesWithCounts = await Promise.all(
    qrCodes.map(async (qr) => {
      const { count } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('qr_code_id', qr.id)

      return { ...qr, scan_count: count || 0 }
    })
  )

  return qrCodesWithCounts
}

export default async function DashboardPage() {
  const qrCodes = await getQRCodes()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">QR Code Dashboard</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <QRCodeForm />
          </div>
          <div className="lg:col-span-2">
            <QRCodeList qrCodes={qrCodes} />
          </div>
        </div>
      </main>
    </div>
  )
}
