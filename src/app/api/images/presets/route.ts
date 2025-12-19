import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const presetsDir = path.join(process.cwd(), 'public', 'presets')

    // Check if directory exists
    if (!fs.existsSync(presetsDir)) {
      return NextResponse.json({ presets: [] })
    }

    const files = fs.readdirSync(presetsDir)
    const presets = files
      .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
      .map(file => {
        const id = file.replace(/\.(png|jpg|jpeg)$/, '')
        return {
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' '),
          url: `/presets/${file}`,
        }
      })

    return NextResponse.json({ presets })
  } catch (error) {
    console.error('Error loading presets:', error)
    return NextResponse.json({ presets: [] })
  }
}
