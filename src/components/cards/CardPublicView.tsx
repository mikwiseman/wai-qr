'use client'

import Image from 'next/image'
import { getThemeById, getDefaultTheme } from '@/lib/card-themes'
import { getPlatformById } from '@/lib/social-platforms'
import { getSocialIconComponent } from '@/components/icons/SocialIcons'

interface SocialLinkData {
  id: string
  platform: string
  url: string
  username: string | null
}

interface CustomLinkData {
  id: string
  title: string
  url: string
  icon: string | null
}

interface CardData {
  id: string
  shortCode: string
  displayName: string
  headline: string | null
  bio: string | null
  avatarUrl: string | null
  coverImageUrl: string | null
  email: string | null
  phone: string | null
  website: string | null
  company: string | null
  jobTitle: string | null
  location: string | null
  themeColor: string
  themeStyle: string
  calendarUrl: string | null
  calendarEmbed: boolean
  showVcardDownload: boolean
  socialLinks: SocialLinkData[]
  customLinks: CustomLinkData[]
}

interface CardPublicViewProps {
  card: CardData
  qrCodeDataUrl?: string
}

export default function CardPublicView({ card, qrCodeDataUrl }: CardPublicViewProps) {
  const theme = getThemeById(card.themeStyle) || getDefaultTheme()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://waiqr.xyz'

  // Track a click
  const trackClick = async (linkType: string, linkId?: string, platform?: string) => {
    try {
      await fetch(`/c/${card.shortCode}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkType, linkId, platform }),
      })
    } catch (error) {
      console.error('Failed to track click:', error)
    }
  }

  const handleSocialClick = (link: SocialLinkData) => {
    trackClick('social', link.id, link.platform)
  }

  const handleCustomClick = (link: CustomLinkData) => {
    trackClick('custom', link.id)
  }

  const handleVcardClick = () => {
    trackClick('vcard')
    // Download vCard
    window.location.href = `/api/cards/${card.id}/vcard`
  }

  const handleCalendarClick = () => {
    trackClick('calendar')
    if (card.calendarUrl) {
      window.open(card.calendarUrl, '_blank')
    }
  }

  const handleContactClick = (type: 'email' | 'phone' | 'website') => {
    trackClick('contact', undefined, type)
  }

  // Get social icon by platform - returns JSX element with platform color
  const renderSocialIcon = (platform: string) => {
    const platformData = getPlatformById(platform)
    const IconComponent = getSocialIconComponent(platform)
    if (IconComponent) {
      return <IconComponent className="w-6 h-6" style={{ color: platformData?.color }} />
    }
    // Fallback to generic link icon
    return (
      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    )
  }

  return (
    <div className={`min-h-screen ${theme.bgClass}`}>
      <div className="max-w-lg mx-auto">
        {/* Cover Image */}
        <div className="relative h-32 bg-gradient-to-r from-violet-500 to-purple-600">
          {card.coverImageUrl && (
            <Image
              src={card.coverImageUrl}
              alt="Cover"
              fill
              className="object-cover"
            />
          )}
        </div>

        {/* Main Card */}
        <div className={`relative -mt-16 mx-4 rounded-2xl ${theme.cardBgClass} ${theme.cardShadowClass} border ${theme.cardBorderClass} overflow-hidden`}>
          {/* Avatar */}
          <div className="flex justify-center -mt-0 pt-4">
            <div className="relative w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
              {card.avatarUrl ? (
                <Image
                  src={card.avatarUrl}
                  alt={card.displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-4xl ${theme.textSecondaryClass}`}>
                  {card.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-6 pt-4 pb-6 text-center">
            <h1 className={`text-2xl font-bold ${theme.textPrimaryClass}`}>
              {card.displayName}
            </h1>
            {card.headline && (
              <p className={`mt-1 text-sm ${theme.textSecondaryClass}`}>
                {card.headline}
              </p>
            )}
            {card.company && (
              <p className={`mt-1 text-sm ${theme.textSecondaryClass}`}>
                {card.company}
              </p>
            )}
            {card.location && (
              <p className={`mt-1 text-sm ${theme.textSecondaryClass}`}>
                📍 {card.location}
              </p>
            )}
            {card.bio && (
              <p className={`mt-4 text-sm ${theme.textSecondaryClass} whitespace-pre-line`}>
                {card.bio}
              </p>
            )}
          </div>

          {/* Contact Info (from vCard fields) */}
          {(card.email || card.phone) && (
            <div className="px-6 pb-4 space-y-2">
              {card.email && (
                <a
                  href={`mailto:${card.email}`}
                  onClick={() => handleContactClick('email')}
                  className={`flex items-center gap-3 w-full py-3 px-4 rounded-xl ${theme.linkBgClass} ${theme.linkHoverClass} ${theme.linkTextClass} transition-colors`}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{card.email}</span>
                </a>
              )}
              {card.phone && (
                <a
                  href={`tel:${card.phone.replace(/\s/g, '')}`}
                  onClick={() => handleContactClick('phone')}
                  className={`flex items-center gap-3 w-full py-3 px-4 rounded-xl ${theme.linkBgClass} ${theme.linkHoverClass} ${theme.linkTextClass} transition-colors`}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{card.phone}</span>
                </a>
              )}
            </div>
          )}

          {/* Social Links & Website */}
          {(card.socialLinks.length > 0 || card.website) && (
            <div className="px-6 pb-4">
              <div className="flex flex-wrap justify-center gap-3">
                {/* Website as circle icon */}
                {card.website && (
                  <a
                    href={card.website.startsWith('http') ? card.website : `https://${card.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleContactClick('website')}
                    className={`w-12 h-12 flex items-center justify-center rounded-full ${theme.socialBgClass} ${theme.socialHoverClass} transition-colors`}
                    title={card.website.replace(/^https?:\/\//, '')}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6366f1' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </a>
                )}
                {/* Social Links */}
                {card.socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleSocialClick(link)}
                    className={`w-12 h-12 flex items-center justify-center rounded-full ${theme.socialBgClass} ${theme.socialHoverClass} transition-colors`}
                    title={getPlatformById(link.platform)?.name || link.platform}
                  >
                    {renderSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Custom Links */}
          {card.customLinks.length > 0 && (
            <div className="px-6 pb-4 space-y-3">
              {card.customLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleCustomClick(link)}
                  className={`block w-full py-3 px-4 rounded-xl text-center ${theme.linkBgClass} ${theme.linkHoverClass} ${theme.linkTextClass} transition-colors`}
                >
                  {link.icon && <span className="mr-2">{link.icon}</span>}
                  {link.title}
                </a>
              ))}
            </div>
          )}

          {/* Calendar Link */}
          {card.calendarUrl && (
            <div className="px-6 pb-4">
              <button
                onClick={handleCalendarClick}
                className={`block w-full py-3 px-4 rounded-xl text-center ${theme.linkBgClass} ${theme.linkHoverClass} ${theme.linkTextClass} transition-colors`}
              >
                📅 Book a Meeting
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-6 pb-6 space-y-3">
            {/* vCard Download */}
            {card.showVcardDownload && (
              <button
                onClick={handleVcardClick}
                className="w-full py-3 px-4 rounded-xl text-white font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: card.themeColor }}
              >
                ⬇️ Save Contact
              </button>
            )}
          </div>

          {/* QR Code and URL */}
          <div className={`px-6 pb-6 text-center border-t ${theme.cardBorderClass} pt-4`}>
            {qrCodeDataUrl && (
              <div className="mb-4 flex justify-center">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <img
                    src={qrCodeDataUrl}
                    alt="Scan to share this card"
                    width={150}
                    height={150}
                    className="rounded"
                  />
                </div>
              </div>
            )}
            <p className={`text-xs ${theme.textSecondaryClass}`}>
              {baseUrl}/c/{card.shortCode}
            </p>
          </div>
        </div>

        {/* Powered by */}
        <div className="text-center py-6">
          <a
            href={baseUrl}
            className={`text-xs ${theme.textSecondaryClass} hover:opacity-70`}
          >
            Powered by WaiQR
          </a>
        </div>
      </div>
    </div>
  )
}
