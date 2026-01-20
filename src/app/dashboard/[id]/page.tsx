import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { generateQRCodeDataURL, CenterImageType } from '@/lib/qrcode'
import { CenterImageType as PrismaCenterImageType } from '@/generated/prisma'
import QRCodeDetail from '@/components/QRCodeDetail'
import LogoutButton from '@/components/LogoutButton'

export const dynamic = 'force-dynamic'

// Map Prisma enum to API values
function fromPrismaCenterImageType(type: PrismaCenterImageType): CenterImageType {
  if (type === 'default_img') return 'default'
  return type as CenterImageType
}

async function getQRCode(id: string, userId: string) {
  const qrCode = await prisma.qRCode.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      _count: {
        select: { scans: true },
      },
    },
  })

  if (!qrCode) {
    return null
  }

  // Generate the redirect URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://waiqr.xyz'
  const redirectUrl = `${baseUrl}/r/${qrCode.shortCode}`

  // Map center image type
  const centerImageType = fromPrismaCenterImageType(qrCode.centerImageType)

  // Generate QR code image as data URL with the stored center image
  const qrImageDataUrl = await generateQRCodeDataURL(redirectUrl, {
    type: centerImageType,
    reference: qrCode.centerImageRef || undefined,
  })

  return {
    id: qrCode.id,
    short_code: qrCode.shortCode,
    destination_url: qrCode.destinationUrl,
    title: qrCode.title,
    created_at: qrCode.createdAt.toISOString(),
    updated_at: qrCode.updatedAt.toISOString(),
    is_active: qrCode.isActive,
    user_id: qrCode.userId,
    center_image_type: centerImageType,
    center_image_ref: qrCode.centerImageRef,
    scan_count: qrCode._count.scans,
    redirectUrl,
    qrImageDataUrl,
  }
}

export default async function QRCodeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const { id } = await params
  const qrCode = await getQRCode(id, session.userId)

  if (!qrCode) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">WaiQR Analytics</h1>
          <LogoutButton />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <QRCodeDetail qrCode={qrCode} />
      </main>
    </div>
  )
}
