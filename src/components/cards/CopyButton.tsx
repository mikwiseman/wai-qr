'use client'

import { useState } from 'react'

interface CopyButtonProps {
  text: string
  className?: string
}

export default function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`px-4 py-2 text-sm bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors ${className}`}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
