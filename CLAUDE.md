# WaiQR - Claude Code Instructions

## Project Overview

WaiQR is a QR code generator and analytics platform. Users can create QR codes with custom center images, track scans with detailed analytics (device, browser, location), and manage their QR codes through a dashboard.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom magic link flow with JWT sessions
- **Email**: Resend for transactional emails
- **Image Processing**: Sharp for resizing/optimization
- **Styling**: Tailwind CSS
- **QR Generation**: qrcode library

## Production Server

- **IP**: 159.65.29.5
- **Domain**: waiqr.xyz
- **Location**: DigitalOcean droplet (4GB RAM, 2 vCPUs)
- **OS**: Ubuntu 24.04

### Server Directory Structure

```
/opt/wai-qr/                    # Application root
├── .next/standalone/           # Production build (Next.js standalone output)
│   ├── public/uploads/         # User uploaded images (writable by www-data)
│   └── server.js               # Entry point for production
├── .env                        # Environment variables
├── prisma/                     # Prisma schema
└── public/                     # Static assets (source)
```

### Services

| Service | Port | Status Command |
|---------|------|----------------|
| wai-qr (Next.js) | 3000 | `systemctl status wai-qr` |
| PostgreSQL | 5432 | `systemctl status postgresql` |
| Nginx | 80/443 | `systemctl status nginx` |

### Useful Commands

```bash
# SSH to server
ssh root@159.65.29.5

# View application logs
journalctl -u wai-qr -f

# Restart application
systemctl restart wai-qr

# Check Nginx config
nginx -t && systemctl reload nginx

# Database access
sudo -u postgres psql waiqr
```

## Database

### Connection

```
Host: localhost
Port: 5432
Database: waiqr
User: waiqr_user
Password: 81IcaepoQxEaU5uycPV14xGx
```

**Connection URL**: `postgresql://waiqr_user:81IcaepoQxEaU5uycPV14xGx@localhost:5432/waiqr`

### Schema (Prisma)

Located at `prisma/schema.prisma`. Key models:

**QR Codes:**
- **User**: Email-based accounts
- **MagicLink**: Passwordless auth tokens (15min expiry)
- **QRCode**: QR codes with destination URL, title, center image config
- **Scan**: Analytics data (device, browser, OS, geolocation)
- **UserImage**: Custom uploaded center images

**Business Cards:**
- **BusinessCard**: Digital business cards with profile, theme, and settings
- **SocialLink**: Social media links (LinkedIn, Twitter, Telegram, etc.)
- **CustomLink**: Custom links with title and icon
- **CardView**: Card view analytics (device, browser, location)
- **LinkClick**: Click tracking for links
- **ContactRequest**: Two-way contact exchange data

### Prisma Commands

```bash
# Generate client after schema changes
npx prisma generate

# Push schema changes to database
npx prisma db push

# Open Prisma Studio (GUI)
npx prisma studio

# Create migration
npx prisma migrate dev --name migration_name
```

## Authentication Flow

1. User enters email at `/login`
2. `POST /api/auth/login` creates MagicLink token, sends email via Resend
3. User clicks link, hits `/auth/callback?token=xxx`
4. Token verified, JWT session created (7-day expiry), cookie set
5. Protected routes check JWT via middleware

### Session Management

- JWT signed with HS256 using `JWT_SECRET`
- Stored in httpOnly cookie named `session`
- 7-day expiration
- Middleware at `src/middleware.ts` protects `/dashboard/*` and `/api/*` routes

## File Storage

User uploaded images are stored locally:

```
/opt/wai-qr/.next/standalone/public/uploads/{user-id}/{nanoid}.png
```

- Images processed with Sharp to 200x200px PNG
- Public URL: `https://waiqr.xyz/uploads/{user-id}/{filename}.png`
- Directory must be writable by www-data user

## Environment Variables

### Required for Production

```env
DATABASE_URL="postgresql://waiqr_user:PASSWORD@localhost:5432/waiqr"
JWT_SECRET="base64-encoded-32-byte-secret"
RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="WAI QR <noreply@mail.waiwai.is>"
NEXT_PUBLIC_BASE_URL="https://waiqr.xyz"
NODE_ENV="production"
PORT="3000"
```

### For Local Development

```env
DATABASE_URL="postgresql://localhost:5432/waiqr_dev"
JWT_SECRET="dev-secret-at-least-32-characters-long"
RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="WAI QR <noreply@mail.waiwai.is>"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/db.ts` | Prisma client singleton |
| `src/lib/auth.ts` | JWT session management (jose library) |
| `src/lib/email.ts` | Resend email sending |
| `src/lib/qrcode.ts` | QR code generation with center images |
| `src/lib/types.ts` | Shared TypeScript types |
| `src/middleware.ts` | Route protection |
| `src/lib/vcard.ts` | vCard 3.0 generation |
| `src/lib/social-platforms.ts` | Social platform definitions (21 platforms) |
| `src/lib/card-themes.ts` | Card theme presets (7 themes) |

## API Routes

### Authentication & Images
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/login` | POST | Send magic link email |
| `/api/auth/logout` | POST | Clear session |
| `/auth/callback` | GET | Verify magic link, create session |
| `/api/images` | GET | List user's uploaded images |
| `/api/images/upload` | POST | Upload center image |
| `/api/images/presets` | GET | List preset center images |

### QR Codes
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/qrcodes` | GET/POST | List/create QR codes |
| `/api/qrcodes/[id]` | GET/PUT/DELETE | Single QR code operations |
| `/api/qrcodes/[id]/stats` | GET | QR code analytics |
| `/r/[code]` | GET | QR code redirect + analytics tracking |

### Business Cards
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/cards` | GET/POST | List/create business cards |
| `/api/cards/[id]` | GET/PATCH/DELETE | Single card operations |
| `/api/cards/[id]/stats` | GET | Card analytics |
| `/api/cards/[id]/vcard` | GET | Download vCard (public) |
| `/api/cards/[id]/contact` | GET/POST/PATCH | Contact requests |
| `/c/[code]` | GET | Public card page |
| `/c/[code]/click` | POST | Track link clicks |

## Deployment Process

### Automatic Deployment (Default)

**DO NOT deploy manually via SSH.** Deployment is fully automated via GitHub Actions.

Simply push to `main` branch:
```bash
git push origin main
```

GitHub Actions will automatically:
1. Pull latest code on server
2. Install dependencies
3. Generate Prisma client
4. Push schema changes to database
5. Build the application
6. Copy static files (preserving user uploads)
7. Restart the service

The workflow is defined in `.github/workflows/deploy.yml`.

### Manual Deploy (Emergency Only)

Only use manual deployment if GitHub Actions is broken:

```bash
# On server
cd /opt/wai-qr

# Backup uploads before deployment
cp -r .next/standalone/public/uploads /tmp/waiqr-uploads-backup

# Pull and build
git pull origin main
npm ci
npx prisma generate
npx prisma db push --skip-generate
npm run build

# Copy static files (preserve uploads!)
cp -r .next/static .next/standalone/.next/
find public -maxdepth 1 -not -name uploads -not -name public -exec cp -r {} .next/standalone/public/ \;

# Restore uploads
rm -rf .next/standalone/public/uploads
mv /tmp/waiqr-uploads-backup .next/standalone/public/uploads

# Fix permissions
chown -R www-data:www-data /opt/wai-qr
chmod 755 /opt/wai-qr/.next/standalone/public/uploads

# Restart service
systemctl restart wai-qr
```

### Nginx Configuration

Located at `/etc/nginx/sites-available/wai-qr`

SSL certificates managed by Certbot (Let's Encrypt), auto-renewal enabled.

## Troubleshooting

### Upload fails with permission error

```bash
ssh root@159.65.29.5 "chown -R www-data:www-data /opt/wai-qr/.next/standalone/public/uploads"
```

### Application not starting

```bash
journalctl -u wai-qr -n 100 --no-pager
```

### Database connection issues

```bash
sudo -u postgres psql -c "\l"  # List databases
sudo -u postgres psql -c "\du"  # List users
```

### SSL certificate renewal

```bash
certbot renew --dry-run  # Test renewal
certbot renew            # Force renewal
```

## Server Notes

This is a dedicated server for WaiQR:

| Project | Port | Directory |
|---------|------|-----------|
| wai-qr | 3000 | /opt/wai-qr |

Components:
- PostgreSQL 16 database
- systemd service (`wai-qr.service`)
- Nginx reverse proxy with SSL (Let's Encrypt)
