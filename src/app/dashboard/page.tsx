import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import QRCodeForm from '@/components/QRCodeForm'
import QRCodeList from '@/components/QRCodeList'
import LogoutButton from '@/components/LogoutButton'
import { CenterImageType as PrismaCenterImageType } from '@/generated/prisma'
import { CenterImageType } from '@/lib/types'

export const dynamic = 'force-dynamic'

// Map Prisma enum to API values
function fromPrismaCenterImageType(type: PrismaCenterImageType): CenterImageType {
  if (type === 'default_img') return 'default'
  return type as CenterImageType
}

async function getQRCodes(userId: string) {
  const qrCodes = await prisma.qRCode.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { scans: true },
      },
    },
  })

  // Transform to match expected API format
  return qrCodes.map(qr => ({
    id: qr.id,
    short_code: qr.shortCode,
    destination_url: qr.destinationUrl,
    title: qr.title,
    created_at: qr.createdAt.toISOString(),
    updated_at: qr.updatedAt.toISOString(),
    is_active: qr.isActive,
    user_id: qr.userId,
    center_image_type: fromPrismaCenterImageType(qr.centerImageType),
    center_image_ref: qr.centerImageRef,
    scan_count: qr._count.scans,
  }))
}

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const qrCodes = await getQRCodes(session.userId)

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">WaiQR Dashboard</h1>
          <LogoutButton />
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
