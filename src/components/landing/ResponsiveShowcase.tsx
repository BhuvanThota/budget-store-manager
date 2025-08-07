// src/components/landing/ResponsiveShowcase.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ResponsiveShowcase() {
  return (
    <section className="py-20 bg-white">
      <div className="container max-w-[900px] w-[75%] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-text mb-4">
            Manage Your Shop, Anywhere.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you&apos;re at the counter, in the back office, or on the go, your shop&apos;s data is always at your fingertips.
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {/* Desktop Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="relative z-10"
          >
            <div className="relative p-2 bg-gray-800 rounded-t-xl shadow-2xl border-b-4 border-gray-600">
              <div className="absolute top-2 left-4 flex gap-1.5">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <Image
                src="/POS_tablet.png"
                alt="Desktop dashboard view"
                width={1920}
                height={1080}
                className="rounded-lg"
              />
            </div>
          </motion.div>
          
          {/* Mobile Image */}
          <motion.div
            initial={{ opacity: 0, x: -50, y: 50, scale: 0.8 }}
            whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="absolute -bottom-12 -left-12 w-1/3 max-w-[200px] z-20"
          >
             <div className="relative p-1.5 bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-600">
               <Image
                  src="/dashboard_mobile.png"
                  alt="Mobile dashboard view"
                  width={400}
                  height={800}
                  className="rounded-lg"
                />
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}