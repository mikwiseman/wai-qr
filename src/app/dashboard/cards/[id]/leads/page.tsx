import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import ContactRequestsList from '@/components/cards/ContactRequestsList'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getCardAndContacts(id: string, userId: string) {
  const card = await prisma.businessCard.findFirst({
    where: { id, userId },
    include: {
      contactRequests: {
        orderBy: { timestamp: 'desc' },
      },
    },
  })

  if (!card) return null

  return {
    card: {
      id: card.id,
      display_name: card.displayName,
      short_code: card.shortCode,
    },
    contacts: card.contactRequests.map(req => ({
      id: req.id,
      name: req.name,
      email: req.email,
      phone: req.phone,
      company: req.company,
      message: req.message,
      timestamp: req.timestamp.toISOString(),
      is_read: req.isRead,
      country: req.country,
      device_type: req.deviceType,
    })),
  }
}

export default async function LeadsPage({ params }: PageProps) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const { id } = await params
  const data = await getCardAndContacts(id, session.userId)

  if (!data) {
    notFound()
  }

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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link href={`/dashboard/cards/${id}`} className="text-violet-600 hover:text-violet-700">
              ← Back to Card
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contact Requests</h1>
                <p className="text-gray-600">
                  People who shared their contact with {data.card.display_name}
                </p>
              </div>
              <span className="text-sm text-gray-500">
                {data.contacts.length} contact{data.contacts.length !== 1 ? 's' : ''}
              </span>
            </div>

            <ContactRequestsList
              cardId={data.card.id}
              contacts={data.contacts}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
