import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import CardForm from '@/components/cards/CardForm'
import CardAnalytics from '@/components/cards/CardAnalytics'
import CopyButton from '@/components/cards/CopyButton'
import CardQRCode from '@/components/cards/CardQRCode'
import { CenterImageType as PrismaCenterImageType } from '@/generated/prisma'
import { CenterImageType } from '@/lib/types'

// Map Prisma enum to API format
function fromPrismaCenterImageType(type: PrismaCenterImageType): CenterImageType {
  if (type === 'default_img') return 'default'
  return type as CenterImageType
}

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getCard(id: string, userId: string) {
  const card = await prisma.businessCard.findFirst({
    where: { id, userId },
    include: {
      socialLinks: {
        orderBy: { sortOrder: 'asc' },
      },
      customLinks: {
        orderBy: { sortOrder: 'asc' },
      },
      _count: {
        select: {
          cardViews: true,
          linkClicks: true,
          contactRequests: true,
        },
      },
    },
  })

  if (!card) return null

  return {
    id: card.id,
    short_code: card.shortCode,
    display_name: card.displayName,
    headline: card.headline,
    bio: card.bio,
    avatar_url: card.avatarUrl,
    cover_image_url: card.coverImageUrl,
    email: card.email,
    phone: card.phone,
    website: card.website,
    company: card.company,
    job_title: card.jobTitle,
    location: card.location,
    theme_color: card.themeColor,
    theme_style: card.themeStyle,
    calendar_url: card.calendarUrl,
    calendar_embed: card.calendarEmbed,
    qr_center_type: fromPrismaCenterImageType(card.qrCenterType),
    qr_center_image: card.qrCenterImage,
    is_active: card.isActive,
    is_public: card.isPublic,
    show_vcard_download: card.showVcardDownload,
    show_contact_form: card.showContactForm,
    created_at: card.createdAt.toISOString(),
    updated_at: card.updatedAt.toISOString(),
    social_links: card.socialLinks.map(link => ({
      id: link.id,
      platform: link.platform,
      url: link.url,
      username: link.username,
      is_visible: link.isVisible,
    })),
    custom_links: card.customLinks.map(link => ({
      id: link.id,
      title: link.title,
      url: link.url,
      icon: link.icon,
      is_visible: link.isVisible,
    })),
    view_count: card._count.cardViews,
    click_count: card._count.linkClicks,
    contact_count: card._count.contactRequests,
  }
}

export default async function EditCardPage({ params }: PageProps) {
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
  const cardUrl = `${baseUrl}/c/${card.short_code}`

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
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link href="/dashboard/cards" className="text-violet-600 hover:text-violet-700">
              ← Back to Cards
            </Link>
            <div className="flex gap-3">
              <Link
                href={`/dashboard/cards/${id}/leads`}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
              >
                View Contacts ({card.contact_count})
              </Link>
              <Link
                href={cardUrl}
                target="_blank"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
              >
                View Card ↗
              </Link>
            </div>
          </div>

          {/* Card URL and QR Code */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1">
                <span className="text-sm text-gray-600">Card URL:</span>
                <a
                  href={cardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-violet-600 hover:text-violet-700"
                >
                  {cardUrl}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <CopyButton text={cardUrl} />
                <CardQRCode cardId={card.id} shortCode={card.short_code} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Card Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Business Card</h1>
                <CardForm mode="edit" card={card} />
              </div>
            </div>

            {/* Analytics */}
            <div className="lg:col-span-1">
              <CardAnalytics cardId={card.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
