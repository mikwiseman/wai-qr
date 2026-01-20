'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getThemeById, getDefaultTheme } from '@/lib/card-themes'
import { getPlatformById, socialPlatforms } from '@/lib/social-platforms'
import ContactFormModal from './ContactFormModal'

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
  showContactForm: boolean
  socialLinks: SocialLinkData[]
  customLinks: CustomLinkData[]
}

interface CardPublicViewProps {
  card: CardData
  qrCodeDataUrl?: string
}

export default function CardPublicView({ card, qrCodeDataUrl }: CardPublicViewProps) {
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactSubmitted, setContactSubmitted] = useState(false)

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

  const handleContactSubmit = async (data: { name: string; email?: string; phone?: string; company?: string; message?: string }) => {
    try {
      const response = await fetch(`/api/cards/${card.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setContactSubmitted(true)
        setShowContactForm(false)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to submit contact:', error)
      return false
    }
  }

  // Get social icon by platform
  const getSocialIcon = (platform: string) => {
    const p = getPlatformById(platform) || socialPlatforms.find(sp => sp.id === platform)
    return p?.icon || '🔗'
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
                <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
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

          {/* Social Links */}
          {card.socialLinks.length > 0 && (
            <div className="px-6 pb-4">
              <div className="flex flex-wrap justify-center gap-3">
                {card.socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleSocialClick(link)}
                    className={`w-12 h-12 flex items-center justify-center rounded-full ${theme.socialBgClass} ${theme.socialHoverClass} transition-colors text-xl`}
                    title={getPlatformById(link.platform)?.name || link.platform}
                  >
                    {getSocialIcon(link.platform)}
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
                className={`w-full py-3 px-4 rounded-xl ${theme.buttonBgClass} ${theme.buttonHoverClass} ${theme.buttonTextClass} font-medium transition-colors`}
              >
                ⬇️ Save Contact
              </button>
            )}

            {/* Contact Form */}
            {card.showContactForm && !contactSubmitted && (
              <button
                onClick={() => setShowContactForm(true)}
                className={`w-full py-3 px-4 rounded-xl border ${theme.cardBorderClass} ${theme.textPrimaryClass} font-medium ${theme.linkHoverClass} transition-colors`}
              >
                ✉️ Send Your Contact
              </button>
            )}

            {contactSubmitted && (
              <div className={`w-full py-3 px-4 rounded-xl bg-green-100 text-green-800 text-center`}>
                ✓ Contact sent successfully!
              </div>
            )}
          </div>

          {/* QR Code and URL */}
          <div className="px-6 pb-6 text-center border-t border-gray-200/50 pt-4">
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

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
        onSubmit={handleContactSubmit}
        cardOwnerName={card.displayName}
      />
    </div>
  )
}
