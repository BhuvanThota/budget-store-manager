// src/components/SideMenu.tsx
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  BarChart3,
  ScanLine,
  Menu,
  X
} from 'lucide-react';

export default function SideMenu() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    {
      href: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard',
      description: 'Overview & Analytics'
    },
    {
      href: '/pos',
      icon: <ScanLine size={20} />,
      label: 'Point of Sale',
      description: 'Create new sales'
    },
    {
      href: '/inventory',
      icon: <Boxes size={20} />,
      label: 'Inventory',
      description: 'Manage Products & Stock'
    },
    {
      href: '/orders',
      icon: <ClipboardList size={20} />,
      label: 'Orders',
      description: 'Sales & Transactions',
      badge: 'Coming Soon'
    },
    {
      href: '/reports',
      icon: <BarChart3 size={20} />,
      label: 'Reports',
      description: 'Business Analytics',
      badge: 'Coming Soon'
    }
  ];

  return (
    <div>
      <button
        onClick={toggleMenu}
        className="p-2 text-white hover:opacity-80 transition-opacity"
        aria-label="Open navigation menu"
      >
        <Menu size={24} />
      </button>

      <div
        className={`fixed inset-0 z-30 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ease-in-out
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleMenu}
      />

      <div
        className={`fixed top-0 left-0 h-full w-[280px] md:w-[320px] z-40 
          bg-white border-r border-gray-200 shadow-xl 
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-brand-primary">
            <h2 className="text-lg font-semibold text-white">Budget Shop Manager</h2>
            <button
              onClick={toggleMenu}
              className="p-1 rounded-full text-white hover:bg-white/20 transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

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

          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              Version 1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}