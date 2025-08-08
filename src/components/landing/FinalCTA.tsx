// src/components/landing/FinalCTA.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-20 bg-brand-background">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-text mb-4">
            Ready to Take Control of Your Shop?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Join other small business owners who have simplified their operations and boosted their profits. Get started in minutes.
          </p>
          <div className="flex justify-center">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-lg text-white bg-brand-primary hover:bg-brand-primary/90 transition-colors shadow-lg text-lg"
            >
              Get Started for Free
              <ArrowRight size={20} />
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}