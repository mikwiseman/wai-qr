import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import CardAnalytics from '@/components/cards/CardAnalytics'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getCard(id: string, userId: string) {
  const card = await prisma.businessCard.findFirst({
    where: { id, userId },
    select: {
      id: true,
      shortCode: true,
      displayName: true,
    },
  })

  return card
}

export default async function CardStatsPage({ params }: PageProps) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const { id } = await params
  const card = await getCard(id, session.userId)

  if (!card) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://waiqr.xyz'
  const cardUrl = `${baseUrl}/c/${card.shortCode}`

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-2xl font-bold text-black hover:text-gray-700">
              WaiQR
            </Link>
            <nav className="flex gap-4">
              <Link href="/dashboard/cards" className="text-violet-600 font-medium">
                Business Cards
              </Link>
              <Link href="/dashboard/qr" className="text-gray-600 hover:text-gray-900">
                QR Codes
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Link href="/dashboard/cards" className="text-violet-600 hover:text-violet-700">
              Business Cards
            </Link>
            <span>/</span>
            <Link href={`/dashboard/cards/${card.id}`} className="text-violet-600 hover:text-violet-700">
              {card.displayName}
            </Link>
            <span>/</span>
            <span>Statistics</span>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Card Statistics</h1>
              <p className="text-gray-600 mt-1">{card.displayName}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/dashboard/cards/${card.id}`}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Edit Card
              </Link>
              <Link
                href={cardUrl}
                target="_blank"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
              >
                View Card
              </Link>
            </div>
          </div>

          {/* Full-width Analytics */}
          <CardAnalytics cardId={card.id} />
        </div>
      </main>
    </div>
  )
}
