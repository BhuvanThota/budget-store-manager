// src/components/landing/Footer.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <Image
              src="/logo-budget-removebg.png"
              alt="Budget Shop Manager Logo"
              width={35}
              height={35}
              className="rounded-md"
            />
            <div>
              <p className="font-bold text-brand-text">Budget Shop Manager</p>
              <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} All rights reserved.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <Link href="#" className="hover:text-brand-primary">Privacy Policy</Link>
            <Link href="#" className="hover:text-brand-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}