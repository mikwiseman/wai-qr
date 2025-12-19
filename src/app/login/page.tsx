import { Suspense } from 'react'
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-2 text-black">
          QR Analytics
        </h1>
        <p className="text-black text-center mb-6">
          Sign in with your email address
        </p>
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
