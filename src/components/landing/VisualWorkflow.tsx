// src/components/landing/VisualWorkflow.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shirt, ReceiptIndianRupee } from 'lucide-react';

import AddProductsAnimation from './AddProductsAnimation';

const steps = [
  {
    title: "1. Add Your Products",
    description: "Easily add all your items to a centralized inventory.",
  },
  {
    title: "2. Make a Sale",
    description: "Use the POS to sell products, which automatically updates your stock.",
  },
  {
    title: "3. Track Your Growth",
    description: "Instantly see your performance with simple, clear analytics.",
  }
];

export default function VisualWorkflow() {
  return (
    <section className="py-12 bg-brand-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-text mb-4">
            It&apos;s as Easy as 1, 2, 3
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our streamlined workflow lets you focus on what matters most: your customers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 items-start">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative w-full h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden mb-6">
                {/* Step 1: Add Products Animation */}
                {index === 0 && <AddProductsAnimation />}
                
                {/* MODIFIED: Step 2: Make a Sale Animation with Counter */}
                {index === 1 && (
                  <div className="w-full h-full relative flex items-center justify-center">
                    {/* The Counter */}
                    <div className="absolute bottom-0 w-full h-8 bg-brand-primary border-t-4 border-brand-primary"></div>
                    
                    {/* Product moving out (left to right) */}
                     <motion.div
                        className="absolute"
                        initial={{ x: "-150%", opacity: 1 }}
                        whileInView={{ x: "150%", opacity: 0 }}
                        transition={{ duration: 3, delay: 0.5, repeat: Infinity, repeatType: "loop", ease: "linear" }}
                     >
                       <Shirt size={48} className="text-green-500" />
                     </motion.div>

                     {/* Rupee moving in (right to left) */}
                     <motion.div
                        className="absolute"
                        initial={{ x: "150%", opacity: 0 }}
                        whileInView={{ x: "-150%", opacity: 1 }}
                        transition={{ duration: 3, delay: 0.5, repeat: Infinity, repeatType: "loop", ease: "linear" }}
                     >
                       <ReceiptIndianRupee size={48} className="text-yellow-500" />
                     </motion.div>
                  </div>
                )}
                
                {/* Step 3: Track Performance Animation */}
                {index === 2 && (
                    <div className="flex items-end h-full w-full p-4 gap-2">
                        {[40, 60, 50, 80, 70].map((height, i) => (
                            <motion.div
                                key={i}
                                className="w-full bg-green-500 rounded-t-md"
                                initial={{ height: 0 }}
                                whileInView={{ height: `${height}%` }}
                                transition={{ type: "spring", stiffness: 100, delay: 0.5 + i * 0.1 }}
                            />
                        ))}
                    </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-brand-text mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}