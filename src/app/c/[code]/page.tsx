import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { parseUserAgent } from '@/lib/user-agent'
import { getGeoLocation } from '@/lib/geolocation'
import { Decimal } from '@/generated/prisma/runtime/library'
import CardPublicView from '@/components/cards/CardPublicView'
import { Metadata } from 'next'

interface PageProps {
  params: Promise<{ code: string }>
}

// Generate metadata for the card
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params

  const card = await prisma.businessCard.findUnique({
    where: { shortCode: code },
  })

  if (!card || !card.isActive || !card.isPublic) {
    return {
      title: 'Card Not Found | WaiQR',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://waiqr.xyz'

  return {
    title: `${card.displayName} | WaiQR`,
    description: card.headline || card.bio || `Digital business card for ${card.displayName}`,
    openGraph: {
      title: card.displayName,
      description: card.headline || card.bio || `Digital business card for ${card.displayName}`,
      url: `${baseUrl}/c/${card.shortCode}`,
      type: 'profile',
      ...(card.avatarUrl && { images: [card.avatarUrl] }),
    },
    twitter: {
      card: 'summary',
      title: card.displayName,
      description: card.headline || card.bio || `Digital business card for ${card.displayName}`,
      ...(card.avatarUrl && { images: [card.avatarUrl] }),
    },
  }
}

export default async function CardPublicPage({ params }: PageProps) {
  const { code } = await params

  // Find the card with all relations
  const card = await prisma.businessCard.findUnique({
    where: { shortCode: code },
    include: {
      socialLinks: {
        where: { isVisible: true },
        orderBy: { sortOrder: 'asc' },
      },
      customLinks: {
        where: { isVisible: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!card) {
    notFound()
  }

  if (!card.isActive || !card.isPublic) {
    notFound()
  }

  // Track the view asynchronously (don't block page render)
  const headersList = await headers()
  const userAgentString = headersList.get('user-agent') || ''
  const forwardedFor = headersList.get('x-forwarded-for')
  const realIP = headersList.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0].trim() || realIP || '127.0.0.1'
  const referrer = headersList.get('referer') || null

  // Parse user agent
  const { deviceType, browser, browserVersion, os, osVersion } = parseUserAgent(userAgentString)

  // Track view in background
  getGeoLocation(ip)
    .then(async (geo) => {
      await prisma.cardView.create({
        data: {
          businessCardId: card.id,
          deviceType,
          browser,
          browserVersion,
          os,
          osVersion,
          ipAddress: ip,
          country: geo.country,
          countryCode: geo.countryCode,
          region: geo.region,
          city: geo.city,
          latitude: geo.latitude !== null ? new Decimal(geo.latitude) : null,
          longitude: geo.longitude !== null ? new Decimal(geo.longitude) : null,
          referrer,
          userAgent: userAgentString,
        },
      })
    })
    .catch(console.error)

  // Transform card data for the component
  const cardData = {
    id: card.id,
    shortCode: card.shortCode,
    displayName: card.displayName,
    headline: card.headline,
    bio: card.bio,
    avatarUrl: card.avatarUrl,
    coverImageUrl: card.coverImageUrl,
    email: card.email,
    phone: card.phone,
    website: card.website,
    company: card.company,
    jobTitle: card.jobTitle,
    location: card.location,
    themeColor: card.themeColor,
    themeStyle: card.themeStyle,
    calendarUrl: card.calendarUrl,
    calendarEmbed: card.calendarEmbed,
    showVcardDownload: card.showVcardDownload,
    showContactForm: card.showContactForm,
    socialLinks: card.socialLinks.map(link => ({
      id: link.id,
      platform: link.platform,
      url: link.url,
      username: link.username,
    })),
    customLinks: card.customLinks.map(link => ({
      id: link.id,
      title: link.title,
      url: link.url,
      icon: link.icon,
    })),
  }

  return <CardPublicView card={cardData} />
}
