import { Resend } from 'resend'

// Only initialize Resend if API key is available (defer to runtime)
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is required')
  }
  return new Resend(apiKey)
}

const EMAIL_FROM = process.env.EMAIL_FROM || 'WAI QR <noreply@waiqr.xyz>'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://waiqr.xyz'

interface SendMagicLinkParams {
  email: string
  token: string
}

/**
 * Send magic link email for authentication
 */
export async function sendMagicLinkEmail({ email, token }: SendMagicLinkParams): Promise<{ success: boolean; error?: string }> {
  const magicLink = `${BASE_URL}/auth/callback?token=${token}`

  try {
    const resend = getResend()
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Sign in to WAI QR',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">WAI QR</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
              <h2 style="color: #1f2937; margin-top: 0;">Sign in to your account</h2>
              <p style="color: #4b5563;">Click the button below to sign in to WAI QR. This link will expire in 15 minutes.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${magicLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Sign In</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="color: #6b7280; font-size: 12px; word-break: break-all;">${magicLink}</p>
            </div>
          </body>
        </html>
      `,
      text: `Sign in to WAI QR\n\nClick this link to sign in: ${magicLink}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this email, you can safely ignore it.`,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: 'Failed to send email' }
  }
}
