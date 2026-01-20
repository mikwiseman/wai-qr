import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import NewCardChoice from '@/components/cards/NewCardChoice'

export const dynamic = 'force-dynamic'

export default async function NewCardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-2xl font-bold text-black hover:text-gray-700">
              WaiQR
            </Link>
            <nav className="flex gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                QR Codes
              </Link>
              <Link href="/dashboard/cards" className="text-violet-600 font-medium">
                Business Cards
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard/cards" className="text-violet-600 hover:text-violet-700">
              ← Back to Cards
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <NewCardChoice />
          </div>
        </div>
      </main>
    </div>
  )
}
