'use client'

import { useState } from 'react'
import CardForm from './CardForm'

interface LinkedInData {
  displayName?: string
  headline?: string
  bio?: string
  avatarUrl?: string
  company?: string
  jobTitle?: string
  location?: string
  linkedinUrl?: string
}

interface InitialCardData {
  display_name: string
  headline: string | null
  bio: string | null
  avatar_url: string | null
  company: string | null
  job_title: string | null
  location: string | null
  social_links: Array<{
    id: string
    platform: string
    url: string
    username: string | null
    is_visible: boolean
  }>
}

export default function NewCardChoice() {
  const [mode, setMode] = useState<'choice' | 'linkedin' | 'manual' | 'form'>('choice')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [initialData, setInitialData] = useState<InitialCardData | undefined>()

  const handleLinkedInSubmit = async () => {
    if (!linkedinUrl.trim()) {
      setError('Please enter a LinkedIn URL')
      return
    }

    if (!linkedinUrl.includes('linkedin.com')) {
      setError('Please enter a valid LinkedIn URL')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/linkedin/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl }),
      })

      const data: LinkedInData = await response.json()

      if (!response.ok) {
        throw new Error((data as unknown as { error: string }).error || 'Failed to fetch LinkedIn data')
      }

      // Transform to initial data format
      const socialLinks = []
      if (data.linkedinUrl) {
        socialLinks.push({
          id: 'linkedin-import',
          platform: 'linkedin',
          url: data.linkedinUrl,
          username: null,
          is_visible: true,
        })
      }

      setInitialData({
        display_name: data.displayName || '',
        headline: data.headline || null,
        bio: data.bio || null,
        avatar_url: data.avatarUrl || null,
        company: data.company || null,
        job_title: data.jobTitle || null,
        location: data.location || null,
        social_links: socialLinks,
      })

      setMode('form')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch LinkedIn data')
    } finally {
      setLoading(false)
    }
  }

  const handleManualCreate = () => {
    setInitialData(undefined)
    setMode('form')
  }

  if (mode === 'form') {
    return <CardForm mode="create" initialData={initialData} />
  }

  if (mode === 'linkedin') {
    return (
      <div className="max-w-md mx-auto">
        <button
          onClick={() => setMode('choice')}
          className="text-violet-600 hover:text-violet-700 mb-6 inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Import from LinkedIn</h2>
          <p className="text-gray-600">
            Enter your LinkedIn profile URL to auto-fill your business card
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={handleLinkedInSubmit}
            disabled={loading || !linkedinUrl.trim()}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Importing...
              </>
            ) : (
              'Import Profile'
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            This will fetch public information including name, headline, bio, avatar, company, job title, and location.
          </p>
        </div>
      </div>
    )
  }

  // Choice mode
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Business Card</h2>
        <p className="text-gray-600">
          Choose how you want to get started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LinkedIn Import Option */}
        <button
          onClick={() => setMode('linkedin')}
          className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left group"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Import from LinkedIn</h3>
          <p className="text-sm text-gray-600">
            Auto-fill your card with your LinkedIn profile data
          </p>
        </button>

        {/* Manual Create Option */}
        <button
          onClick={handleManualCreate}
          className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-violet-500 hover:shadow-md transition-all text-left group"
        >
          <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-violet-200 transition-colors">
            <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Create Manually</h3>
          <p className="text-sm text-gray-600">
            Start from scratch and fill in your details
          </p>
        </button>
      </div>
    </div>
  )
}
