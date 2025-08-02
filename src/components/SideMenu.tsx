// src/components/SideMenu.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SideMenu() {
  const [isOpen, setIsOpen] = useState(false)

  // This effect prevents the page from scrolling when the menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div>
      {/* --- Sandwich Icon Button --- */}
      <button
        onClick={toggleMenu}
        className="p-2 text-white hover:opacity-80 transition-opacity"
        aria-label="Open navigation menu"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* --- Backdrop Overlay --- */}
      <div
        className={`fixed inset-0 z-30 bg-transparent transition-opacity duration-300 ease-in-out
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleMenu}
      />

      {/* --- Slide-in Panel --- */}
      <div
        className={`fixed top-0 left-0 h-full w-[50%] md:w-[30%] max-w-xs z-40 
          bg-brand-background border-r border-gray-200 shadow-xl 
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-brand-text">Navigation</h2>
            <button
              onClick={toggleMenu}
              className="p-1 rounded-full text-brand-text hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Navigation Links */}
          <nav className="flex-grow overflow-y-auto p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="flex items-center w-full p-3 text-base font-medium 
                  text-brand-text rounded-lg hover:bg-brand-background/10 transition-colors"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
              </li>
              {/* Add more links here in the future */}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  )
}