// src/components/landing/HowItWorks.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PackagePlus, ScanLine, BarChartHorizontal } from 'lucide-react';

const steps = [
  {
    icon: PackagePlus,
    title: 'Add Products & Stock',
    description: 'Easily add your products and categories in the Inventory. Use Purchase Orders to log new stock arrivals, which automatically updates your inventory levels and average costs.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50'
  },
  {
    icon: ScanLine,
    title: 'Sell with the POS',
    description: 'Our lightning-fast Point of Sale (POS) system makes checkouts a breeze. Find products instantly by searching or filtering, and watch your stock levels update automatically with every sale.',
    color: 'text-green-500',
    bgColor: 'bg-green-50'
  },
  {
    icon: BarChartHorizontal,
    title: 'Track Performance',
    description: 'Use the dashboard and reports to see how your business is doing. Track revenue, profits, top-selling products, and purchase history to make smarter, data-driven decisions.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50'
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-brand-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-text mb-4">
            Get Started in 3 Simple Steps
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From setup to sale, our workflow is designed to be intuitive and fast.
          </p>
        </motion.div>

        <div className="relative">
          {/* Dotted line for desktop view */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5">
            <svg width="100%" height="2">
              <line x1="0" y1="1" x2="100%" y2="1" strokeWidth="2" strokeDasharray="8 8" className="stroke-gray-300" />
            </svg>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="text-center"
              >
                <div className="relative z-10">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${step.bgColor} border-4 border-brand-background shadow-lg`}>
                    <step.icon size={36} className={step.color} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-brand-text mb-2">{step.title}</h3>
                <p className="text-gray-600 px-4">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}