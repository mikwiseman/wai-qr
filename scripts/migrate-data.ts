/**
 * Data Migration Script: Supabase to PostgreSQL
 *
 * This script migrates data from Supabase to the new self-hosted PostgreSQL database.
 *
 * Prerequisites:
 * 1. Set up environment variables:
 *    - SUPABASE_URL: Your Supabase project URL
 *    - SUPABASE_SERVICE_KEY: Your Supabase service role key (not anon key)
 *    - DATABASE_URL: Your new PostgreSQL connection string
 *
 * 2. Run: npx tsx scripts/migrate-data.ts
 *
 * What this script does:
 * 1. Fetches all users from Supabase Auth
 * 2. Creates corresponding users in PostgreSQL
 * 3. Migrates all QR codes, preserving IDs
 * 4. Migrates all scans
 * 5. Downloads images from Supabase Storage and saves to /public/uploads/
 * 6. Updates user_images records with new local paths
 */

import { createClient } from '@supabase/supabase-js'
import { PrismaClient, CenterImageType } from '../src/generated/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { Decimal } from '../src/generated/prisma/runtime/library'

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY // Use service role key for admin access
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables:')
  console.error('- SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_KEY (service role key)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const prisma = new PrismaClient()

// Map Supabase center_image_type to Prisma enum
function mapCenterImageType(type: string | null): CenterImageType {
  switch (type) {
    case 'default':
      return 'default_img'
    case 'preset':
      return 'preset'
    case 'custom':
      return 'custom'
    case 'none':
      return 'none'
    default:
      return 'default_img'
  }
}

async function migrateUsers() {
  console.log('Migrating users...')

  // Fetch users from Supabase Auth (requires service role key)
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('Error fetching auth users:', authError)
    return new Map<string, string>()
  }

  const userIdMap = new Map<string, string>() // Old ID -> New ID

  for (const authUser of authUsers.users) {
    try {
      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email: authUser.email! },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: authUser.id, // Preserve original ID
            email: authUser.email!,
            createdAt: new Date(authUser.created_at),
            updatedAt: new Date(authUser.updated_at || authUser.created_at),
          },
        })
        console.log(`  Created user: ${authUser.email}`)
      } else {
        console.log(`  User already exists: ${authUser.email}`)
      }

      userIdMap.set(authUser.id, user.id)
    } catch (error) {
      console.error(`  Error migrating user ${authUser.email}:`, error)
    }
  }

  console.log(`Migrated ${userIdMap.size} users`)
  return userIdMap
}

async function migrateQRCodes(userIdMap: Map<string, string>) {
  console.log('\nMigrating QR codes...')

  const { data: qrCodes, error } = await supabase
    .from('qr_codes')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching QR codes:', error)
    return
  }

  let migrated = 0
  let skipped = 0

  for (const qr of qrCodes || []) {
    try {
      // Check if already migrated
      const existing = await prisma.qRCode.findUnique({
        where: { id: qr.id },
      })

      if (existing) {
        skipped++
        continue
      }

      const userId = userIdMap.get(qr.user_id) || qr.user_id

      await prisma.qRCode.create({
        data: {
          id: qr.id,
          shortCode: qr.short_code,
          destinationUrl: qr.destination_url,
          title: qr.title,
          createdAt: new Date(qr.created_at),
          updatedAt: new Date(qr.updated_at),
          isActive: qr.is_active,
          userId: userId,
          centerImageType: mapCenterImageType(qr.center_image_type),
          centerImageRef: qr.center_image_ref,
        },
      })
      migrated++
    } catch (error) {
      console.error(`  Error migrating QR code ${qr.short_code}:`, error)
    }
  }

  console.log(`Migrated ${migrated} QR codes, skipped ${skipped} existing`)
}

async function migrateScans() {
  console.log('\nMigrating scans...')

  // Fetch scans in batches
  const batchSize = 1000
  let offset = 0
  let totalMigrated = 0
  let totalSkipped = 0

  while (true) {
    const { data: scans, error } = await supabase
      .from('scans')
      .select('*')
      .order('timestamp', { ascending: true })
      .range(offset, offset + batchSize - 1)

    if (error) {
      console.error('Error fetching scans:', error)
      break
    }

    if (!scans || scans.length === 0) {
      break
    }

    for (const scan of scans) {
      try {
        // Check if already migrated
        const existing = await prisma.scan.findUnique({
          where: { id: scan.id },
        })

        if (existing) {
          totalSkipped++
          continue
        }

        await prisma.scan.create({
          data: {
            id: scan.id,
            qrCodeId: scan.qr_code_id,
            timestamp: new Date(scan.timestamp),
            deviceType: scan.device_type,
            browser: scan.browser,
            browserVersion: scan.browser_version,
            os: scan.os,
            osVersion: scan.os_version,
            ipAddress: scan.ip_address,
            country: scan.country,
            countryCode: scan.country_code,
            region: scan.region,
            city: scan.city,
            latitude: scan.latitude !== null ? new Decimal(scan.latitude) : null,
            longitude: scan.longitude !== null ? new Decimal(scan.longitude) : null,
            referrer: scan.referrer,
            userAgent: scan.user_agent,
          },
        })
        totalMigrated++
      } catch (error) {
        // Skip if QR code doesn't exist (foreign key constraint)
        console.error(`  Error migrating scan ${scan.id}:`, (error as Error).message)
      }
    }

    console.log(`  Processed batch: ${offset} - ${offset + scans.length}`)
    offset += batchSize

    if (scans.length < batchSize) {
      break
    }
  }

  console.log(`Migrated ${totalMigrated} scans, skipped ${totalSkipped} existing`)
}

async function migrateImages(userIdMap: Map<string, string>) {
  console.log('\nMigrating images...')

  const { data: images, error } = await supabase
    .from('user_images')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching user images:', error)
    return
  }

  let migrated = 0
  let skipped = 0

  for (const image of images || []) {
    try {
      // Check if already migrated
      const existing = await prisma.userImage.findUnique({
        where: { id: image.id },
      })

      if (existing) {
        skipped++
        continue
      }

      // Download image from Supabase Storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('qr-center-images')
        .download(image.storage_path)

      if (downloadError || !fileData) {
        console.error(`  Error downloading image ${image.storage_path}:`, downloadError)
        continue
      }

      // Create user directory
      const userId = userIdMap.get(image.user_id) || image.user_id
      const userDir = path.join(UPLOADS_DIR, userId)
      await mkdir(userDir, { recursive: true })

      // Extract filename from storage path
      const filename = path.basename(image.storage_path)
      const newStoragePath = `${userId}/${filename}`
      const localPath = path.join(userDir, filename)

      // Write file to disk
      const buffer = Buffer.from(await fileData.arrayBuffer())
      await writeFile(localPath, buffer)

      // Create database record
      await prisma.userImage.create({
        data: {
          id: image.id,
          userId: userId,
          storagePath: newStoragePath,
          originalFilename: image.original_filename,
          fileSize: image.file_size,
          createdAt: new Date(image.created_at),
        },
      })

      migrated++
      console.log(`  Migrated image: ${image.storage_path} -> ${newStoragePath}`)
    } catch (error) {
      console.error(`  Error migrating image ${image.id}:`, error)
    }
  }

  console.log(`Migrated ${migrated} images, skipped ${skipped} existing`)
}

async function updateQRCodeImageRefs() {
  console.log('\nUpdating QR code image references...')

  // Update center_image_ref from Supabase URLs to local paths
  const qrCodes = await prisma.qRCode.findMany({
    where: {
      centerImageType: 'custom',
      centerImageRef: {
        contains: 'supabase',
      },
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://waiqr.xyz'
  let updated = 0

  for (const qr of qrCodes) {
    if (!qr.centerImageRef) continue

    // Find matching user image by storage path
    const userImage = await prisma.userImage.findFirst({
      where: {
        userId: qr.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (userImage) {
      const newRef = `${baseUrl}/uploads/${userImage.storagePath}`
      await prisma.qRCode.update({
        where: { id: qr.id },
        data: { centerImageRef: newRef },
      })
      updated++
    }
  }

  console.log(`Updated ${updated} QR code image references`)
}

async function main() {
  console.log('Starting data migration from Supabase to PostgreSQL...\n')

  try {
    // Ensure uploads directory exists
    await mkdir(UPLOADS_DIR, { recursive: true })

    // Step 1: Migrate users
    const userIdMap = await migrateUsers()

    // Step 2: Migrate QR codes
    await migrateQRCodes(userIdMap)

    // Step 3: Migrate scans
    await migrateScans()

    // Step 4: Migrate images
    await migrateImages(userIdMap)

    // Step 5: Update QR code image references
    await updateQRCodeImageRefs()

    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
