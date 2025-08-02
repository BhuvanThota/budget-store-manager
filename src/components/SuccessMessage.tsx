// src/components/SuccessMessage.tsx

'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SuccessMessage() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('')
  const [show, setShow] = useState(false)

  useEffect(() => {
    const messageParam = searchParams.get('message')
    if (messageParam) {
      setMessage(decodeURIComponent(messageParam))
      setShow(true)
      
      // Auto-hide message after 8 seconds
      const timer = setTimeout(() => {
        setShow(false)
      }, 8000)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!show || !message) return null

  return (
    <div className="mb-6">
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-green-800">{message}</p>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={() => setShow(false)}
              className="inline-flex text-green-400 hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-green-50 rounded"
              aria-label="Dismiss message"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}