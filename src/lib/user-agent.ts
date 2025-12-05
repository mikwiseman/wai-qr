import { UAParser } from 'ua-parser-js'

export interface ParsedUserAgent {
  deviceType: string
  browser: string
  browserVersion: string
  os: string
  osVersion: string
}

export function parseUserAgent(userAgentString: string): ParsedUserAgent {
  const parser = new UAParser(userAgentString)
  const result = parser.getResult()

  let deviceType = 'desktop'
  if (result.device.type === 'mobile') deviceType = 'mobile'
  else if (result.device.type === 'tablet') deviceType = 'tablet'

  return {
    deviceType,
    browser: result.browser.name || 'Unknown',
    browserVersion: result.browser.version || '',
    os: result.os.name || 'Unknown',
    osVersion: result.os.version || '',
  }
}
