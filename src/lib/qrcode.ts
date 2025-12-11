import QRCode from 'qrcode'
import sharp from 'sharp'
import path from 'path'

const QR_SIZE = 400
const LOGO_SIZE_PERCENT = 0.22 // Logo is 22% of QR code size (safe for H-level error correction)

async function addLogoToQR(qrBuffer: Buffer): Promise<Buffer> {
  const logoSize = Math.floor(QR_SIZE * LOGO_SIZE_PERCENT)
  const logoPosition = Math.floor((QR_SIZE - logoSize) / 2)

  // Load and resize logo
  const logoPath = path.join(process.cwd(), 'eyes.png')
  const resizedLogo = await sharp(logoPath)
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

export async function generateQRCodeDataURL(url: string): Promise<string> {
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

  const qrWithLogo = await addLogoToQR(qrBuffer)
  return `data:image/png;base64,${qrWithLogo.toString('base64')}`
}

export async function generateQRCodeBuffer(url: string): Promise<Buffer> {
  // Use H-level error correction (30%) to allow logo overlay
  const qrBuffer = await QRCode.toBuffer(url, {
    width: QR_SIZE,
    margin: 2,
    type: 'png',
    errorCorrectionLevel: 'H',
  })

  return addLogoToQR(qrBuffer)
}
