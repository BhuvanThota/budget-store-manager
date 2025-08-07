// src/components/landing/KeyFeaturesShowcase.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Smartphone
} from 'lucide-react';

const features = [
  {
    icon: Package,
    title: "Smart Inventory",
    description: "Real-time stock tracking, low-stock alerts, and category management.",
    color: "text-blue-500",
    bgColor: "bg-blue-50"
  },
  {
    icon: ShoppingCart,
    title: "Fast Point-of-Sale",
    description: "An intuitive POS that syncs with your inventory instantly after every sale.",
    color: "text-green-500",
    bgColor: "bg-green-50"
  },
  {
    icon: BarChart3,
    title: "Insightful Reports",
    description: "Understand your profits, top products, and sales trends with simple reports.",
    color: "text-orange-500",
    bgColor: "bg-orange-50"
  },
  {
    icon: Smartphone,
    title: "Works Everywhere",
    description: "Manage your shop from your desktop, tablet, or phone. No app required.",
    color: "text-purple-500",
    bgColor: "bg-purple-50"
  }
];

export default function KeyFeaturesShowcase() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-text mb-4">
            A Simpler Way to Run Your Shop
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            All the essential features you need, without the complexity you don&apos;t.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${feature.bgColor}`}>
                <feature.icon size={32} className={feature.color} />
              </div>
              <h3 className="text-xl font-bold text-brand-text mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}