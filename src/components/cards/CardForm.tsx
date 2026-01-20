'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cardThemes, accentColors } from '@/lib/card-themes'
import { socialPlatforms, getPlatformById } from '@/lib/social-platforms'

interface SocialLinkInput {
  platform: string
  url: string
  username?: string
  isVisible?: boolean
}

interface CustomLinkInput {
  title: string
  url: string
  icon?: string
  isVisible?: boolean
}

interface CardData {
  id: string
  short_code: string
  display_name: string
  headline: string | null
  bio: string | null
  avatar_url: string | null
  cover_image_url: string | null
  email: string | null
  phone: string | null
  website: string | null
  company: string | null
  job_title: string | null
  location: string | null
  theme_color: string
  theme_style: string
  calendar_url: string | null
  calendar_embed: boolean
  is_active: boolean
  is_public: boolean
  show_vcard_download: boolean
  show_contact_form: boolean
  social_links: Array<{
    id: string
    platform: string
    url: string
    username: string | null
    is_visible: boolean
  }>
  custom_links: Array<{
    id: string
    title: string
    url: string
    icon: string | null
    is_visible: boolean
  }>
}

interface CardFormProps {
  mode: 'create' | 'edit'
  card?: CardData
}

export default function CardForm({ mode, card }: CardFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Profile fields
  const [displayName, setDisplayName] = useState(card?.display_name || '')
  const [headline, setHeadline] = useState(card?.headline || '')
  const [bio, setBio] = useState(card?.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(card?.avatar_url || '')
  const [coverImageUrl, setCoverImageUrl] = useState(card?.cover_image_url || '')

  // Contact fields
  const [email, setEmail] = useState(card?.email || '')
  const [phone, setPhone] = useState(card?.phone || '')
  const [website, setWebsite] = useState(card?.website || '')
  const [company, setCompany] = useState(card?.company || '')
  const [jobTitle, setJobTitle] = useState(card?.job_title || '')
  const [location, setLocation] = useState(card?.location || '')

  // Theme
  const [themeStyle, setThemeStyle] = useState(card?.theme_style || 'modern')
  const [themeColor, setThemeColor] = useState(card?.theme_color || '#8B5CF6')

  // Calendar
  const [calendarUrl, setCalendarUrl] = useState(card?.calendar_url || '')
  const [calendarEmbed, setCalendarEmbed] = useState(card?.calendar_embed || false)

  // Settings
  const [isActive, setIsActive] = useState(card?.is_active !== false)
  const [isPublic, setIsPublic] = useState(card?.is_public !== false)
  const [showVcardDownload, setShowVcardDownload] = useState(card?.show_vcard_download !== false)
  const [showContactForm, setShowContactForm] = useState(card?.show_contact_form !== false)

  // Social links
  const [socialLinks, setSocialLinks] = useState<SocialLinkInput[]>(
    card?.social_links?.map(l => ({
      platform: l.platform,
      url: l.url,
      username: l.username || undefined,
      isVisible: l.is_visible,
    })) || []
  )

  // Custom links
  const [customLinks, setCustomLinks] = useState<CustomLinkInput[]>(
    card?.custom_links?.map(l => ({
      title: l.title,
      url: l.url,
      icon: l.icon || undefined,
      isVisible: l.is_visible,
    })) || []
  )

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'linkedin', url: '', isVisible: true }])
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  const updateSocialLink = (index: number, field: string, value: string | boolean) => {
    const updated = [...socialLinks]
    updated[index] = { ...updated[index], [field]: value }
    setSocialLinks(updated)
  }

  const addCustomLink = () => {
    setCustomLinks([...customLinks, { title: '', url: '', isVisible: true }])
  }

  const removeCustomLink = (index: number) => {
    setCustomLinks(customLinks.filter((_, i) => i !== index))
  }

  const updateCustomLink = (index: number, field: string, value: string | boolean) => {
    const updated = [...customLinks]
    updated[index] = { ...updated[index], [field]: value }
    setCustomLinks(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!displayName.trim()) {
      setError('Display name is required')
      return
    }

    setLoading(true)

    try {
      const body = {
        displayName: displayName.trim(),
        headline: headline.trim() || null,
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        coverImageUrl: coverImageUrl.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        website: website.trim() || null,
        company: company.trim() || null,
        jobTitle: jobTitle.trim() || null,
        location: location.trim() || null,
        themeStyle,
        themeColor,
        calendarUrl: calendarUrl.trim() || null,
        calendarEmbed,
        isActive,
        isPublic,
        showVcardDownload,
        showContactForm,
        socialLinks: socialLinks.filter(l => l.url.trim()),
        customLinks: customLinks.filter(l => l.title.trim() && l.url.trim()),
      }

      const url = mode === 'create' ? '/api/cards' : `/api/cards/${card?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save card')
      }

      router.push('/dashboard/cards')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save card')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Profile Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="John Doe"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="Senior Developer at Tech Company"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="Acme Inc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="Product Manager"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="San Francisco, CA"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
              placeholder="A short bio about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avatar URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="https://example.com/cover.jpg"
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Info (for vCard)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
      </section>

      {/* Social Links Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Social Links</h2>
          <button
            type="button"
            onClick={addSocialLink}
            className="text-sm text-violet-600 hover:text-violet-700"
          >
            + Add Link
          </button>
        </div>

        <div className="space-y-3">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex gap-2 items-start">
              <select
                value={link.platform}
                onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                {socialPlatforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.name}
                  </option>
                ))}
              </select>
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                placeholder={getPlatformById(link.platform)?.placeholder || 'https://...'}
              />
              <button
                type="button"
                onClick={() => removeSocialLink(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                ✕
              </button>
            </div>
          ))}
          {socialLinks.length === 0 && (
            <p className="text-sm text-gray-500">No social links added yet</p>
          )}
        </div>
      </section>

      {/* Custom Links Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Custom Links</h2>
          <button
            type="button"
            onClick={addCustomLink}
            className="text-sm text-violet-600 hover:text-violet-700"
          >
            + Add Link
          </button>
        </div>

        <div className="space-y-3">
          {customLinks.map((link, index) => (
            <div key={index} className="flex gap-2 items-start">
              <input
                type="text"
                value={link.icon || ''}
                onChange={(e) => updateCustomLink(index, 'icon', e.target.value)}
                className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-center"
                placeholder="📎"
                maxLength={2}
              />
              <input
                type="text"
                value={link.title}
                onChange={(e) => updateCustomLink(index, 'title', e.target.value)}
                className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                placeholder="Link Title"
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateCustomLink(index, 'url', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={() => removeCustomLink(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                ✕
              </button>
            </div>
          ))}
          {customLinks.length === 0 && (
            <p className="text-sm text-gray-500">No custom links added yet</p>
          )}
        </div>
      </section>

      {/* Calendar Integration */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Calendar Integration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calendar URL (Calendly, Cal.com, etc.)
            </label>
            <input
              type="url"
              value={calendarUrl}
              onChange={(e) => setCalendarUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="https://calendly.com/yourusername"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={calendarEmbed}
              onChange={(e) => setCalendarEmbed(e.target.checked)}
              className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
            />
            <span className="text-sm text-gray-700">Embed calendar widget (if supported)</span>
          </label>
        </div>
      </section>

      {/* Theme Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Theme</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {cardThemes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setThemeStyle(theme.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    themeStyle === theme.id
                      ? 'border-violet-600 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{theme.name}</div>
                  <div className="text-xs text-gray-500">{theme.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accent Color
            </label>
            <div className="flex flex-wrap gap-2">
              {accentColors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setThemeColor(color.value)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    themeColor === color.value ? 'border-gray-900' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Settings Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
            />
            <span className="text-sm text-gray-700">Card is active</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
            />
            <span className="text-sm text-gray-700">Card is publicly visible</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showVcardDownload}
              onChange={(e) => setShowVcardDownload(e.target.checked)}
              className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
            />
            <span className="text-sm text-gray-700">Show &quot;Save Contact&quot; button</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showContactForm}
              onChange={(e) => setShowContactForm(e.target.checked)}
              className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
            />
            <span className="text-sm text-gray-700">Show &quot;Send Your Contact&quot; form</span>
          </label>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-medium rounded-lg transition-colors"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Card' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
