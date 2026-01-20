import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import CardsList from '@/components/cards/CardsList'

export const dynamic = 'force-dynamic'

async function getCards(userId: string) {
  const cards = await prisma.businessCard.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          cardViews: true,
          linkClicks: true,
        },
      },
    },
  })

  return cards.map(card => ({
    id: card.id,
    short_code: card.shortCode,
    display_name: card.displayName,
    headline: card.headline,
    avatar_url: card.avatarUrl,
    theme_style: card.themeStyle,
    is_active: card.isActive,
    created_at: card.createdAt.toISOString(),
    view_count: card._count.cardViews,
    click_count: card._count.linkClicks,
  }))
}

export default async function CardsPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const cards = await getCards(session.userId)

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-2xl font-bold text-black hover:text-gray-700">
              WaiQR
            </Link>
            <nav className="flex gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                QR Codes
              </Link>
              <Link href="/dashboard/cards" className="text-violet-600 font-medium">
                Business Cards
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Cards</h1>
            <p className="text-gray-600 mt-1">Create and manage your digital business cards</p>
          </div>
          <Link
            href="/dashboard/cards/new"
            className="bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Create Card
          </Link>
        </div>

        <CardsList cards={cards} />
      </main>
    </div>
  )
}
