import { createServerSupabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { generateQRCodeDataURL } from '@/lib/qrcode'
import QRCodeDetail from '@/components/QRCodeDetail'
import LogoutButton from '@/components/LogoutButton'

export const dynamic = 'force-dynamic'

async function getQRCode(id: string) {
  const supabase = await createServerSupabase()

  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !qrCode) {
    return null
  }

  // Get scan count
  const { count } = await supabase
    .from('scans')
    .select('*', { count: 'exact', head: true })
    .eq('qr_code_id', id)

  // Generate the redirect URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://waiqr.xyz'
  const redirectUrl = `${baseUrl}/r/${qrCode.short_code}`

  // Generate QR code image as data URL
  const qrImageDataUrl = await generateQRCodeDataURL(redirectUrl)

  return {
    ...qrCode,
    scan_count: count || 0,
    redirectUrl,
    qrImageDataUrl,
  }
}

export default async function QRCodeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const qrCode = await getQRCode(id)

  if (!qrCode) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">QR Code Analytics</h1>
          <LogoutButton />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <QRCodeDetail qrCode={qrCode} />
      </main>
    </div>
  )
}
