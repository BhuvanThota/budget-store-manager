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

  const menuItems = [
    {
      href: '/dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z" />
        </svg>
      ),
      label: 'Dashboard',
      description: 'Overview & Analytics'
    },
    {
      href: '/inventory',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      label: 'Inventory',
      description: 'Manage Products & Stock'
    },
    {
      href: '/orders',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: 'Orders',
      description: 'Sales & Transactions',
      badge: 'Coming Soon'
    },
    {
      href: '/requests',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      label: 'Requests',
      description: 'Customer Requests',
      badge: 'Coming Soon'
    },
    {
      href: '/reports',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      label: 'Reports',
      description: 'Business Analytics',
      badge: 'Coming Soon'
    }
  ]

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
        className={`fixed inset-0 z-30 bg-black/20 transition-opacity duration-300 ease-in-out
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleMenu}
      />

      {/* --- Slide-in Panel --- */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] md:w-[320px] z-40 
          bg-white border-r border-gray-200 shadow-xl 
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-brand-primary">
            <h2 className="text-lg font-semibold text-white">Budget Shop Manager</h2>
            <button
              onClick={toggleMenu}
              className="p-1 rounded-full text-white hover:bg-white/20 transition-colors"
              aria-label="Close menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Navigation Links */}
          <nav className="flex-grow overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.href}>
                  {item.badge ? (
                    <div className="flex items-center justify-between w-full p-3 text-gray-400 rounded-lg cursor-not-allowed">
                      <div className="flex items-center">
                        <div className="mr-3 text-gray-400">
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {item.badge}
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex items-center w-full p-3 text-brand-text rounded-lg hover:bg-brand-secondary transition-colors group"
                      onClick={toggleMenu}
                    >
                      <div className="mr-3 text-brand-primary group-hover:text-brand-text">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-gray-600">{item.description}</div>
                      </div>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              Version 1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}