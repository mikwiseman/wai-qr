export interface GeoLocation {
  country: string | null
  countryCode: string | null
  region: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
}

export async function getGeoLocation(ip: string): Promise<GeoLocation> {
  // Skip localhost/private IPs
  if (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.')
  ) {
    return {
      country: null,
      countryCode: null,
      region: null,
      city: null,
      latitude: null,
      longitude: null,
    }
  }

  try {
    // Using ip-api.com (free, no API key required for non-commercial use)
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon`
    )
    const data = await response.json()

    if (data.status === 'success') {
      return {
        country: data.country,
        countryCode: data.countryCode,
        region: data.regionName,
        city: data.city,
        latitude: data.lat,
        longitude: data.lon,
      }
    }
  } catch (error) {
    console.error('Geolocation lookup failed:', error)
  }

  return {
    country: null,
    countryCode: null,
    region: null,
    city: null,
    latitude: null,
    longitude: null,
  }
}

export function getClientIP(request: Request): string {
  // Check various headers for the real IP (behind proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback (usually localhost in development)
  return '127.0.0.1'
}
