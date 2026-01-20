import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const ENRICH_LAYER_URL = 'https://enrichlayer.com/api/v2/profile'

interface EnrichLayerResponse {
  full_name?: string
  headline?: string
  summary?: string
  about?: string
  profile_pic_url?: string
  city?: string
  country?: string
  experiences?: Array<{
    company?: string
    title?: string
  }>
  public_identifier?: string
}

interface EnrichResult {
  displayName?: string
  headline?: string
  bio?: string
  avatarUrl?: string
  company?: string
  jobTitle?: string
  location?: string
  linkedinUrl?: string
}

function isValidLinkedInUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname === 'linkedin.com' || parsed.hostname === 'www.linkedin.com'
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = process.env.ENRICH_LAYER_API_KEY
    if (!apiKey) {
      console.error('ENRICH_LAYER_API_KEY is not configured')
      return NextResponse.json({ error: 'LinkedIn import is not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { linkedinUrl } = body

    if (!linkedinUrl) {
      return NextResponse.json({ error: 'LinkedIn URL is required' }, { status: 400 })
    }

    if (!isValidLinkedInUrl(linkedinUrl)) {
      return NextResponse.json({ error: 'Invalid LinkedIn URL' }, { status: 400 })
    }

    // Call Enrich Layer API
    const response = await fetch(`${ENRICH_LAYER_URL}?url=${encodeURIComponent(linkedinUrl)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'LinkedIn profile not found' }, { status: 404 })
      }
      if (response.status === 429) {
        return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
      }
      return NextResponse.json({ error: 'Failed to fetch LinkedIn data' }, { status: response.status })
    }

    const data: EnrichLayerResponse = await response.json()

    // Map Enrich Layer response to our format
    const result: EnrichResult = {}

    if (data.full_name) {
      result.displayName = data.full_name
    }

    if (data.headline) {
      result.headline = data.headline
    }

    if (data.summary || data.about) {
      result.bio = data.summary || data.about
    }

    if (data.profile_pic_url) {
      result.avatarUrl = data.profile_pic_url
    }

    // Get location from city and country
    if (data.city || data.country) {
      const locationParts = [data.city, data.country].filter(Boolean)
      result.location = locationParts.join(', ')
    }

    // Get company and job title from most recent experience
    if (data.experiences && data.experiences.length > 0) {
      const currentJob = data.experiences[0]
      if (currentJob.company) {
        result.company = currentJob.company
      }
      if (currentJob.title) {
        result.jobTitle = currentJob.title
      }
    }

    // Build LinkedIn URL from public identifier if available
    if (data.public_identifier) {
      result.linkedinUrl = `https://www.linkedin.com/in/${data.public_identifier}`
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('LinkedIn enrich error:', error)
    return NextResponse.json({ error: 'Failed to fetch LinkedIn data' }, { status: 500 })
  }
}
