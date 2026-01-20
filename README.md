# WaiQR

A QR code generator, analytics platform, and digital business card builder. Create custom QR codes with center logos, track scans with detailed analytics, build beautiful digital business cards, and manage everything through an intuitive dashboard.

**Live Demo**: [waiqr.xyz](https://waiqr.xyz)

## Features

### QR Codes
- **Custom QR Codes**: Generate QR codes with custom center images (presets or upload your own)
- **Analytics Dashboard**: Track scans with device type, browser, OS, and geolocation data
- **Download PNG**: Export QR codes for print or digital use

### Digital Business Cards
- **Beautiful Themes**: 7 pre-built themes (Modern, Dark, Gradient, Minimal, Ocean, Sunset, Nature)
- **Social Links**: Support for 21+ social platforms (LinkedIn, Twitter, Telegram, Instagram, GitHub, etc.)
- **Custom Links**: Add portfolio, booking, or any custom links with emoji icons
- **vCard Download**: One-tap contact saving to phone
- **Two-Way Exchange**: Visitors can share their contact back with you
- **Calendar Integration**: Connect Calendly, Cal.com, and other booking platforms
- **Full Analytics**: Track views, clicks, and contact submissions
- **QR Code Sharing**: Each card has a unique short URL and QR code

### General
- **Magic Link Auth**: Passwordless authentication via email
- **Responsive Design**: Works on desktop and mobile devices
- **Fast & Lightweight**: Built with Next.js 16 App Router

## Tech Stack

- [Next.js 16](https://nextjs.org/) - React framework with App Router
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Prisma](https://www.prisma.io/) - ORM
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Resend](https://resend.com/) - Email delivery
- [Sharp](https://sharp.pixelplumbing.com/) - Image processing

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Resend API key (for email authentication)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/wai-qr.git
cd wai-qr
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="postgresql://localhost:5432/waiqr_dev"
JWT_SECRET="your-secret-key-at-least-32-characters"
RESEND_API_KEY="re_your_api_key"
EMAIL_FROM="Your App <noreply@yourdomain.com>"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

4. Set up the database:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── qrcodes/       # QR code CRUD operations
│   │   ├── cards/         # Business cards CRUD operations
│   │   └── images/        # Image upload/management
│   ├── dashboard/         # Dashboard pages
│   │   └── cards/         # Business cards management
│   ├── c/[code]/          # Public card page
│   ├── login/             # Login page
│   └── r/[code]/          # QR code redirect handler
├── components/            # React components
│   └── cards/             # Business card components
├── lib/                   # Utility libraries
│   ├── auth.ts           # JWT session management
│   ├── db.ts             # Prisma client
│   ├── email.ts          # Email sending
│   ├── qrcode.ts         # QR code generation
│   ├── vcard.ts          # vCard generation
│   ├── social-platforms.ts # Social platform definitions
│   ├── card-themes.ts    # Card theme presets
│   └── types.ts          # TypeScript types
└── generated/            # Generated Prisma client
prisma/
└── schema.prisma         # Database schema
public/
├── presets/              # Preset center images
└── uploads/              # User uploaded images
```

## Database Schema

The app uses the following main models:

**Core:**
- **User**: Email-based user accounts
- **MagicLink**: Passwordless authentication tokens

**QR Codes:**
- **QRCode**: QR codes with destination URL, title, and center image configuration
- **Scan**: Analytics data for each QR code scan
- **UserImage**: Custom uploaded center images

**Business Cards:**
- **BusinessCard**: Digital cards with profile, theme, and settings
- **SocialLink**: Social media links
- **CustomLink**: Custom links with title and icon
- **CardView**: Card view analytics
- **LinkClick**: Link click tracking
- **ContactRequest**: Two-way contact exchange

See `prisma/schema.prisma` for the complete schema.

## API Endpoints

### Authentication

- `POST /api/auth/login` - Send magic link email
- `POST /api/auth/logout` - Clear session
- `GET /auth/callback?token=xxx` - Verify magic link

### QR Codes

- `GET /api/qrcodes` - List user's QR codes
- `POST /api/qrcodes` - Create new QR code
- `GET /api/qrcodes/[id]` - Get QR code details
- `PUT /api/qrcodes/[id]` - Update QR code
- `DELETE /api/qrcodes/[id]` - Delete QR code
- `GET /api/qrcodes/[id]/stats` - Get scan analytics
- `GET /r/[code]` - Redirect to destination URL (tracks analytics)

### Business Cards

- `GET /api/cards` - List user's business cards
- `POST /api/cards` - Create new card
- `GET /api/cards/[id]` - Get card details with links
- `PATCH /api/cards/[id]` - Update card
- `DELETE /api/cards/[id]` - Delete card
- `GET /api/cards/[id]/stats` - Get card analytics
- `GET /api/cards/[id]/vcard` - Download vCard (public)
- `POST /api/cards/[id]/contact` - Submit contact request (public)
- `GET /api/cards/[id]/contact` - List contact requests (owner only)
- `GET /c/[code]` - Public card page

### Images

- `GET /api/images` - List user's uploaded images
- `POST /api/images/upload` - Upload center image
- `GET /api/images/presets` - List preset images

## Development

### Running Tests

```bash
npm test
```

### Database Operations

```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# Create a migration
npx prisma migrate dev --name your_migration_name

# Reset database
npx prisma migrate reset
```

### Building for Production

```bash
npm run build
```

The app uses Next.js standalone output for production deployment.

## Deployment

The app is deployed on a DigitalOcean droplet with:

- Nginx as reverse proxy
- systemd for process management
- Let's Encrypt SSL certificates
- PostgreSQL database

See `CLAUDE.md` for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [qrcode](https://www.npmjs.com/package/qrcode) - QR code generation
- [jose](https://www.npmjs.com/package/jose) - JWT implementation
- [nanoid](https://www.npmjs.com/package/nanoid) - ID generation
