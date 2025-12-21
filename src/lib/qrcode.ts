import QRCode from 'qrcode'
import sharp from 'sharp'
import path from 'path'
import { CenterImageType } from './supabase'

export type { CenterImageType }

const QR_SIZE = 400
const LOGO_SIZE_PERCENT = 0.22 // Logo is 22% of QR code size (safe for H-level error correction)

export interface LogoOptions {
  type: CenterImageType
  reference?: string // preset name or storage URL
}

async function getLogoBuffer(options: LogoOptions): Promise<Buffer | null> {
  if (options.type === 'none') {
    return null
  }

  if (options.type === 'default') {
    const logoPath = path.join(process.cwd(), 'eyes.png')
    return sharp(logoPath).toBuffer()
  }

  if (options.type === 'preset' && options.reference) {
    const presetPath = path.join(process.cwd(), 'public', 'presets', `${options.reference}.png`)
    return sharp(presetPath).toBuffer()
  }

  if (options.type === 'custom' && options.reference) {
    // Fetch from Supabase Storage URL
    try {
      const response = await fetch(options.reference)
      if (!response.ok) {
        console.error('Failed to fetch custom logo:', response.status)
        return null
      }
      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (error) {
      console.error('Error fetching custom logo:', error)
      return null
    }
  }

  // Fallback to default if something goes wrong
  const logoPath = path.join(process.cwd(), 'eyes.png')
  return sharp(logoPath).toBuffer()
}

async function addLogoToQR(qrBuffer: Buffer, logoOptions?: LogoOptions): Promise<Buffer> {
  // If no logo options provided, use default
  const options = logoOptions || { type: 'default' as CenterImageType }

  const logoBuffer = await getLogoBuffer(options)

  // If no logo (type === 'none' or error), return QR as-is
  if (!logoBuffer) {
    return qrBuffer
  }

  const logoSize = Math.floor(QR_SIZE * LOGO_SIZE_PERCENT)
  const logoPosition = Math.floor((QR_SIZE - logoSize) / 2)

  // Resize logo
  const resizedLogo = await sharp(logoBuffer)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer()

  // Create white background circle/square for logo to sit on (improves contrast)
  const padding = 8
  const backgroundSize = logoSize + padding * 2
  const backgroundPosition = logoPosition - padding

  const whiteBackground = await sharp({
    create: {
      width: backgroundSize,
      height: backgroundSize,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  }).png().toBuffer()

  // Composite: QR code + white background + logo
  return sharp(qrBuffer)
    .composite([
      { input: whiteBackground, left: backgroundPosition, top: backgroundPosition },
      { input: resizedLogo, left: logoPosition, top: logoPosition }
    ])
    .png()
    .toBuffer()
}

export async function generateQRCodeDataURL(url: string, logoOptions?: LogoOptions): Promise<string> {
  // Use H-level error correction (30%) to allow logo overlay
  const qrBuffer = await QRCode.toBuffer(url, {
    width: QR_SIZE,
    margin: 2,
    type: 'png',
    errorCorrectionLevel: 'H',
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })

  const qrWithLogo = await addLogoToQR(qrBuffer, logoOptions)
  return `data:image/png;base64,${qrWithLogo.toString('base64')}`
}

export async function generateQRCodeBuffer(url: string, logoOptions?: LogoOptions): Promise<Buffer> {
  // Use H-level error correction (30%) to allow logo overlay
  const qrBuffer = await QRCode.toBuffer(url, {
    width: QR_SIZE,
    margin: 2,
    type: 'png',
    errorCorrectionLevel: 'H',
  })

  return addLogoToQR(qrBuffer, logoOptions)
}
