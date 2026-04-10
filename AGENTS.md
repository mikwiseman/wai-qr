# WaiQR

QR code generator + analytics platform with digital business cards.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL 16 + Prisma ORM
- **Auth**: Magic link (Resend email) + JWT sessions (jose)
- **Image processing**: Sharp (200x200 PNG)
- **Styling**: Tailwind CSS
- **QR generation**: qrcode library

## Production

- **Server**: 159.65.29.5 (DigitalOcean, Ubuntu 24.04)
- **Domain**: waiqr.xyz
- **App path**: `/opt/wai-qr`
- **Services**: systemd `wai-qr` (port 3000), PostgreSQL, Nginx + Certbot SSL
- **DB**: `postgresql://waiqr_user:81IcaepoQxEaU5uycPV14xGx@localhost:5432/waiqr`

## Deployment

Push to `main` -- GitHub Actions handles everything (pull, install, prisma generate, db push, build, restart).

Manual deploy (emergency only): see CLAUDE.md git history for full procedure.

## Key Routes

- `/r/[code]` -- QR redirect + scan tracking
- `/c/[code]` -- public business card page
- `/dashboard/*` -- protected by JWT middleware (`src/middleware.ts`)
- `/api/auth/login` -- magic link flow
- `/api/qrcodes`, `/api/cards` -- CRUD + analytics

## Prisma

```bash
npx prisma generate       # After schema changes
npx prisma db push        # Push to DB
npx prisma migrate dev    # Create migration
```

Schema: `prisma/schema.prisma`. Models: User, QRCode, Scan, BusinessCard, SocialLink, CustomLink, CardView, LinkClick, ContactRequest.

## File Storage

User uploads: `/opt/wai-qr/.next/standalone/public/uploads/{user-id}/{nanoid}.png`
Public URL: `https://waiqr.xyz/uploads/{user-id}/{filename}.png`
Directory must be writable by `www-data`.
