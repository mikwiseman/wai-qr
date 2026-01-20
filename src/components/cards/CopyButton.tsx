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
      className={`px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors ${className}`}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
