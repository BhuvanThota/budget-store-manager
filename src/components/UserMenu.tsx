// src/components/UserMenu.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import type { User } from '@prisma/client'

// The component needs to know about the user to display name/image
interface UserMenuProps {
  user: Pick<User, 'name' | 'image' | 'email'> | null
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // This effect closes the menu if you click outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuRef])

  // Helper component for menu items
  const MenuItem = ({ href, children, onClick }: { href?: string; children: React.ReactNode; onClick?: () => void }) => {
    const content = (
      <div
        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
        onClick={() => {
          if (onClick) onClick();
          setIsOpen(false);
        }}
      >
        {children}
      </div>
    );

    return href ? <Link href={href}>{content}</Link> : <button className="w-full text-left">{content}</button>;
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* --- User Avatar as Toggle Button --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ring-brand-primary"
        aria-label="Toggle user menu"
      >
        {user?.image ? (
          <Image
            src={user.image}
            alt="User profile"
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 font-medium">{user?.name?.charAt(0)}</span>
          </div>
        )}
      </button>

      {/* --- Dropdown Menu --- */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-72 bg-white text-gray-800 rounded-lg border border-gray-200 shadow-lg z-20"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              {user?.image && <Image src={user.image} alt="User profile" width={24} height={24} className="rounded-full" />}
              <span className="text-sm font-semibold text-brand-text">{user?.name}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
              aria-label="Close menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Links */}
          <div className="p-2">
            <MenuItem href="/settings">
              <svg className="h-5 w-5 mr-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L8 7.48a1 1 0 01-1.34.85l-4.2-1.7a1 1 0 00-1.28.53l-2 3.46a1 1 0 00.22 1.34l3.4 3.4a1 1 0 010 1.48l-3.4 3.4a1 1 0 00-.22 1.34l2 3.46a1 1 0 001.28.53l4.2-1.7a1 1 0 011.34.85l.52 4.31c.38 1.56 2.6 1.56 2.98 0l.52-4.31a1 1 0 011.34-.85l4.2 1.7a1 1 0 001.28-.53l2-3.46a1 1 0 00-.22-1.34l-3.4-3.4a1 1 0 010-1.48l3.4-3.4a1 1 0 00.22-1.34l-2-3.46a1 1 0 00-1.28-.53l-4.2 1.7a1 1 0 01-1.34-.85l-.52-4.31zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Settings
            </MenuItem>
          </div>

          {/* Sign Out Button */}
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={() => {
                signOut({ callbackUrl: '/' });
                setIsOpen(false);
              }}
              style={{ backgroundColor: 'var(--brand-accent)' }}
              className="flex items-center w-full px-3 py-2 text-sm font-semibold text-white rounded-md hover:opacity-90 transition-colors"
            >
              <svg className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}