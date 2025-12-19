import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-black mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-black mb-4">Page Not Found</h2>
        <p className="text-black mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
